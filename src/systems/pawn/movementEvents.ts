export type MovementState = 'IDLE' | 'STARTING' | 'MOVING' | 'TURNING' | 'LANDING' | 'SETTLING';

type MovementEventType = 
  | 'MOVEMENT_START'
  | 'MOVEMENT_TILE_STEP'
  | 'MOVEMENT_CORNER'
  | 'MOVEMENT_LANDING'
  | 'MOVEMENT_SETTLED';

type MovementEventPayload = {
  type: MovementEventType;
  nodeId?: number;
  direction?: string;
};

type MovementEventHandler = (payload: MovementEventPayload) => void;

class MovementEventBus {
  private listeners: Record<string, MovementEventHandler[]> = {};

  on(event: MovementEventType, callback: MovementEventHandler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: MovementEventType, callback: MovementEventHandler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: MovementEventType, payload: Omit<MovementEventPayload, 'type'> = {}) {
    if (!this.listeners[event]) return;
    const fullPayload = { type: event, ...payload } as MovementEventPayload;
    this.listeners[event].forEach(cb => cb(fullPayload));
  }
}

export const movementEvents = new MovementEventBus();
