import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { composeReducers, composeTick, composeAction } from '../../src/state/reducerComposer';
import { createInitialState } from '../../src/state/initialState';
import { GameState } from '../../src/types';
import * as LevelManager from '../../src/services/LevelManager';

// Mock slice reducers to verify routing
vi.mock('../../src/state/slices/resourcesSlice', () => ({
    resourcesReducer: vi.fn((state) => ({ ...state, resources: { ...state.resources, test: 'resources' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/inventorySlice', () => ({
    inventoryReducer: vi.fn((state) => ({ ...state, inventory: { ...state.inventory, test: 'inventory' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/proficiencySlice', () => ({
    proficiencyReducer: vi.fn((state) => ({ ...state, proficiency: { ...state.proficiency, test: 'proficiency' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/eventsSlice', () => ({
    eventsReducer: vi.fn((state) => ({ ...state, activeEvent: { id: 'testEvent' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/backshopSlice', () => ({
    backshopReducer: vi.fn((state) => ({ ...state, resources: { ...state.resources, test: 'backshop' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/complianceSlice', () => ({
    complianceReducer: vi.fn((state) => ({ ...state, resources: { ...state.resources, test: 'compliance' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/aircraftSlice', () => ({
    aircraftReducer: vi.fn((state) => ({ ...state, activeAircraft: { id: 'testAircraft' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/terminalLocationSlice', () => ({
    terminalLocationReducer: vi.fn((state) => ({ ...state, resources: { ...state.resources, test: 'terminalLocation' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/officeSlice', () => ({
    officeReducer: vi.fn((state) => ({ ...state, mail: [{ id: 'testMail' }], logs: state.logs }))
}));
vi.mock('../../src/state/slices/hangarSlice', () => ({
    hangarReducer: vi.fn((state) => ({ ...state, resources: { ...state.resources, test: 'hangar' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/shopSlice', () => ({
    shopReducer: vi.fn((state) => ({ ...state, resources: { ...state.resources, test: 'shop' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/petSlice', () => ({
    petReducer: vi.fn((state) => ({ ...state, pet: { ...state.pet, test: 'pet' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/encountersSlice', () => ({
    encountersReducer: vi.fn((state) => ({ ...state, resources: { ...state.resources, test: 'encounters' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/procurementSlice', () => ({
    procurementReducer: vi.fn((state) => ({ ...state, procurement: { ...state.procurement, test: 'procurement' }, logs: state.logs }))
}));
vi.mock('../../src/state/slices/bulletinBoardSlice', () => ({
    bulletinBoardReducer: vi.fn((state) => ({ ...state, bulletinBoard: { ...state.bulletinBoard, test: 'bulletin' } }))
}));
vi.mock('../../src/state/slices/aogSlice', () => ({
    aogReducer: vi.fn((state) => ({ ...state, aog: { ...state.aog, test: 'aog' } }))
}));
vi.mock('../../src/state/slices/terminalSlice', () => ({
    terminalReducer: vi.fn((state) => ({ ...state, archiveTerminal: { ...state.archiveTerminal, test: 'archive' } }))
}));
vi.mock('../../src/state/slices/timeSlice', () => ({
    timeReducer: vi.fn((state) => ({ ...state, shiftCycle: state.shiftCycle }))
}));

describe('reducerComposer coverage', () => {
    let state: GameState;

    beforeEach(() => {
        state = createInitialState();
        vi.restoreAllMocks();
        // Allow all actions by default
        vi.spyOn(LevelManager, 'isActionUnlocked').mockReturnValue(true);
    });

    describe('composeTick', () => {
        it('should route to resourcesReducer', () => {
            const nextState = composeTick(state, 100, 'HANGAR');
            // Using implicit knowledge that our mock sets resources.test
            expect((nextState.resources as any).test).toBe('resources');
        });

        it('should route to aogReducer if aog active', () => {
            state.aog.active = true;
            const nextState = composeTick(state, 100, 'HANGAR');
            expect((nextState.aog as any).test).toBe('aog');
        });

        it('should route to procurementReducer', () => {
             const nextState = composeTick(state, 100, 'HANGAR');
             expect((nextState.procurement as any).test).toBe('procurement');
        });

        // Toolroom status update test
        it('should update toolroom status', async () => {
            state.toolroom.nextStatusChange = Date.now() - 1000;
            // mock inventoryReducer handles UPDATE_TOOLROOM_STATUS which updates toolroom
            // But our mock returns generic 'test' inventory.
            // Wait, composeTick calls inventoryReducer for toolroom status.
            // Our mock returns { ...state, inventory: ..., logs: ... }.
            // It does NOT update 'toolroom' property on the returned object in the mock above.
            // We need to fix the mock for inventorySlice to return toolroom if we want to test that.
            // Or just check that inventoryReducer was called with correct type.

            // Let's rely on call arguments
            const { inventoryReducer } = await import('../../src/state/slices/inventorySlice');
            composeTick(state, 100, 'HANGAR');
            expect(inventoryReducer).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'UPDATE_TOOLROOM_STATUS' }));
        });
    });

    describe('composeAction Routing', () => {
        it('should route RESOURCE_ACTIONS', () => {
            const nextState = composeAction(state, { type: 'LOG_FLAVOR' });
            expect((nextState.resources as any).test).toBe('resources');
        });

        it('should route INVENTORY_ACTIONS', () => {
            const nextState = composeAction(state, { type: 'HARVEST_ROTABLE' });
            expect((nextState.inventory as any).test).toBe('inventory');
        });

        it('should route PROFICIENCY_ACTIONS', () => {
            const nextState = composeAction(state, { type: 'UNLOCK_SKILL' });
            expect((nextState.proficiency as any).test).toBe('proficiency');
        });

        it('should route EVENT_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'RESOLVE_EVENT' });
             expect(nextState.activeEvent?.id).toBe('testEvent');
        });

        it('should route BACKSHOP_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'CLEAN_ULD' });
             expect((nextState.resources as any).test).toBe('backshop');
        });

        it('should route COMPLIANCE_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'REVIEW_COMPLIANCE' });
             expect((nextState.resources as any).test).toBe('compliance');
        });

        it('should route AIRCRAFT_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'SERVICE_LAVATORY' });
             expect(nextState.activeAircraft?.id).toBe('testAircraft');
        });

        it('should route TERMINAL_LOCATION_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'WATCH_BOARDS' });
             expect((nextState.resources as any).test).toBe('terminalLocation');
        });

        it('should route OFFICE_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'CHECK_INTERNAL_MAIL' });
             expect(nextState.mail[0].id).toBe('testMail');
        });

        it('should route HANGAR_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'FOD_SWEEP' });
             expect((nextState.resources as any).test).toBe('hangar');
        });

        it('should route SHOP_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'BUY_SHOP_ITEM' });
             expect((nextState.resources as any).test).toBe('shop');
        });

        it('should route PET_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'PET_CAT' });
             expect((nextState.pet as any).test).toBe('pet');
        });

        it('should route ENCOUNTERS_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'OBSERVE_SEDAN' });
             expect((nextState.resources as any).test).toBe('encounters');
        });

        it('should route PROCUREMENT_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'PLACE_ORDER' });
             expect((nextState.procurement as any).test).toBe('procurement');
        });

        it('should route TERMINAL_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'ARCHIVE_ACTION', payload: { command: 'test', triggerEvent: vi.fn() } });
             expect((nextState.archiveTerminal as any).test).toBe('archive');
        });

        it('should route AOG_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'START_AOG_ACTION' });
             expect((nextState.aog as any).test).toBe('aog');
        });

        it('should route BULLETIN_BOARD_ACTIONS', () => {
             const nextState = composeAction(state, { type: 'ROTATE_BULLETIN' });
             expect((nextState.bulletinBoard as any).test).toBe('bulletin');
        });
    });

    describe('Level Gating', () => {
        it('should block locked action', () => {
            vi.spyOn(LevelManager, 'isActionUnlocked').mockReturnValue(false);
            vi.spyOn(LevelManager, 'getLockedFeatureMessage').mockReturnValue('Locked');

            // Mock resourcesReducer not to be called or return state
            const nextState = composeAction(state, { type: 'LOCKED_ACTION' });

            // Should add notification
            expect(nextState.notificationQueue).toHaveLength(1);
            expect(nextState.notificationQueue[0].message).toBe('Locked');

            // Should increment violations
            expect(nextState.stats.accessViolations).toBe(1);
        });

        it('should escalate violations', () => {
            vi.spyOn(LevelManager, 'isActionUnlocked').mockReturnValue(false);

            state.stats.accessViolations = 2;
            let nextState = composeAction(state, { type: 'LOCKED_ACTION' });
            expect(nextState.logs[0].type).toBe('warning'); // 3rd violation

            state.stats.accessViolations = 4;
            nextState = composeAction(state, { type: 'LOCKED_ACTION' });
            expect(nextState.logs[0].type).toBe('error'); // 5th violation

            state.stats.accessViolations = 7;
            nextState = composeAction(state, { type: 'LOCKED_ACTION' });
            expect(nextState.logs[0].type).toBe('vibration'); // 8th violation

            state.stats.accessViolations = 14;
            nextState = composeAction(state, { type: 'LOCKED_ACTION' });
            expect(nextState.logs[0].type).toBe('error'); // 15th violation
        });
    });
});
