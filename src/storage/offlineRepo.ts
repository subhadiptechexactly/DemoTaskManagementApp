import { addTaskWithId, updateTask as fbUpdateTask, deleteTask as fbDeleteTask, getCurrentUserId } from '../firebase/config';
import { openRealm, getRealmSync, TaskR, PendingChange, PendingOpType, toTaskR } from './realm';

// Helper to make a deterministic ID when creating offline
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensureRealm() {
  await openRealm();
}

export async function saveTaskLocal(task: any) {
  await ensureRealm();
  const realm = getRealmSync();
  realm.write(() => {
    realm.create<TaskR>('TaskR', toTaskR(task), Realm.UpdateMode.Modified);
  });
}

export async function deleteTaskLocal(taskId: string) {
  await ensureRealm();
  const realm = getRealmSync();
  realm.write(() => {
    const obj = realm.objectForPrimaryKey<TaskR>('TaskR', taskId);
    if (obj) realm.delete(obj);
  });
}

export async function getAllTasksLocal(): Promise<any[]> {
  await ensureRealm();
  const realm = getRealmSync();
  const rows = realm.objects<TaskR>('TaskR');
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    isCompleted: r.isCompleted,
    dueDate: r.dueDate ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    userId: r.userId,
  }));
}

export async function queueChange(op: PendingOpType, taskId: string, payload?: any) {
  await ensureRealm();
  const realm = getRealmSync();
  realm.write(() => {
    realm.create<PendingChange>('PendingChange', {
      id: genId(),
      op,
      taskId,
      payload: payload ? JSON.stringify(payload) : null,
      timestamp: Date.now(),
    });
  });
}

export async function processQueue() {
  await ensureRealm();
  const realm = getRealmSync();
  const items = realm.objects<PendingChange>('PendingChange').sorted('timestamp');
  const uid = getCurrentUserId();
  if (!uid) return; // still not authenticated

  for (const item of items) {
    try {
      const payload = item.payload ? JSON.parse(item.payload) : undefined;
      if (item.op === 'add' || item.op === 'update') {
        if (item.op === 'add') {
          const taskLocal = realm.objectForPrimaryKey<TaskR>('TaskR', item.taskId);
          // fall back if missing
          const data = payload || (taskLocal && {
            title: taskLocal.title,
            description: taskLocal.description ?? null,
            isCompleted: taskLocal.isCompleted,
            dueDate: taskLocal.dueDate ? new Date(taskLocal.dueDate) : null,
          });
          if (!data) { realm.write(() => realm.delete(item)); continue; }
          const res = await addTaskWithId(item.taskId, data);
          if (!res.error) {
            // success
          }
        } else {
          const res = await fbUpdateTask(item.taskId, payload);
          if (res.error) throw new Error(res.error);
        }
      } else if (item.op === 'delete') {
        const res = await fbDeleteTask(item.taskId);
        if (res.error) throw new Error(res.error);
      }
      // remove processed item
      realm.write(() => { realm.delete(item); });
    } catch (e) {
      // stop processing further to avoid tight loop
      break;
    }
  }
}

// Public APIs for UI
export async function repoAddTask(input: {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  isCompleted?: boolean;
  userId: string;
}) {
  const id = input.id || genId();
  const nowIso = new Date().toISOString();
  const task = {
    id,
    title: input.title,
    description: input.description,
    isCompleted: !!input.isCompleted,
    dueDate: input.dueDate ? input.dueDate.toISOString() : undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
    userId: input.userId,
  };

  // Optimistic local save
  await saveTaskLocal(task);

  // Try remote
  try {
    const uid = getCurrentUserId();
    if (!uid) throw new Error('no-auth');
    const res = await addTaskWithId(id, {
      title: task.title,
      description: task.description ?? null,
      isCompleted: task.isCompleted,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    });
    if (res.error) throw new Error(res.error);
  } catch (e) {
    // queue add
    await queueChange('add', id, {
      title: task.title,
      description: task.description ?? null,
      isCompleted: task.isCompleted,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    });
  }

  return { id };
}

export async function repoUpdateTask(id: string, updates: {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  dueDate?: Date | null;
}) {
  const realmUpdates: any = { id, updatedAt: new Date().toISOString() };
  if (updates.title !== undefined) realmUpdates.title = updates.title;
  if (updates.description !== undefined) realmUpdates.description = updates.description;
  if (updates.isCompleted !== undefined) realmUpdates.isCompleted = updates.isCompleted;
  if (updates.dueDate !== undefined) realmUpdates.dueDate = updates.dueDate ? updates.dueDate.toISOString() : null;

  await ensureRealm();
  const realm = getRealmSync();
  realm.write(() => {
    realm.create<TaskR>('TaskR', realmUpdates, Realm.UpdateMode.Modified);
  });

  try {
    const uid = getCurrentUserId();
    if (!uid) throw new Error('no-auth');
    const res = await fbUpdateTask(id, {
      ...('title' in updates ? { title: updates.title } : {}),
      ...('description' in updates ? { description: updates.description ?? null } : {}),
      ...('isCompleted' in updates ? { isCompleted: updates.isCompleted } : {}),
      ...('dueDate' in updates ? { dueDate: updates.dueDate ?? null } : {}),
    });
    if (res.error) throw new Error(res.error);
  } catch (e) {
    await queueChange('update', id, {
      ...('title' in updates ? { title: updates.title } : {}),
      ...('description' in updates ? { description: updates.description ?? null } : {}),
      ...('isCompleted' in updates ? { isCompleted: updates.isCompleted } : {}),
      ...('dueDate' in updates ? { dueDate: updates.dueDate ?? null } : {}),
    });
  }
}

export async function repoDeleteTask(id: string) {
  await deleteTaskLocal(id);
  try {
    const uid = getCurrentUserId();
    if (!uid) throw new Error('no-auth');
    const res = await fbDeleteTask(id);
    if (res.error) throw new Error(res.error);
  } catch (e) {
    await queueChange('delete', id);
  }
}
