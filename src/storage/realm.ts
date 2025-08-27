import Realm from 'realm';

export class TaskR extends Realm.Object<TaskR> {
  id!: string;
  title!: string;
  description?: string | null;
  isCompleted!: boolean;
  dueDate?: string | null; // store as ISO string for simplicity
  createdAt!: string; // ISO
  updatedAt!: string; // ISO
  userId!: string;

  static schema: Realm.ObjectSchema = {
    name: 'TaskR',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      description: 'string?',
      isCompleted: { type: 'bool', default: false },
      dueDate: 'string?',
      createdAt: 'string',
      updatedAt: 'string',
      userId: 'string',
    },
  };
}

export type PendingOpType = 'add' | 'update' | 'delete';

export class PendingChange extends Realm.Object<PendingChange> {
  id!: string; // uuid
  op!: PendingOpType;
  taskId!: string;
  payload?: string | null; // JSON string of partial task updates for add/update
  timestamp!: number;

  static schema: Realm.ObjectSchema = {
    name: 'PendingChange',
    primaryKey: 'id',
    properties: {
      id: 'string',
      op: 'string',
      taskId: 'string',
      payload: 'string?',
      timestamp: 'int',
    },
  };
}

let realmInstance: Realm | null = null;

export async function openRealm(): Promise<Realm> {
  if (realmInstance) return realmInstance;
  realmInstance = await Realm.open({ schema: [TaskR, PendingChange] });
  return realmInstance;
}

export function getRealmSync(): Realm {
  if (!realmInstance) {
    throw new Error('Realm not opened. Call openRealm() first.');
  }
  return realmInstance;
}

export function toTaskR(task: any): TaskR {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    isCompleted: !!task.isCompleted,
    dueDate: task.dueDate ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    userId: task.userId,
  } as TaskR;
}
