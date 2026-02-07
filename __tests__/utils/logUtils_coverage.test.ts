import { describe, it, expect } from 'vitest';
import { getLogStyles, getNotificationVariantForLogType } from '../../src/utils/logUtils';
import { LogMessage } from '../../src/types';

describe('logUtils', () => {
    describe('getLogStyles', () => {
        const types: LogMessage['type'][] = ['info', 'warning', 'error', 'vibration', 'story', 'levelup'];

        it('should return styles for all defined types', () => {
            types.forEach(type => {
                const styles = getLogStyles(type);
                expect(styles).toHaveProperty('container');
                expect(styles).toHaveProperty('prefix');
                expect(styles).toHaveProperty('animation');
            });
        });

        it('should return default styles for unknown type', () => {
            const styles = getLogStyles('unknown' as any);
            expect(styles.prefix).toBe('[ MSG ]');
        });

        it('should return correct prefix for info', () => {
             expect(getLogStyles('info').prefix).toBe('[ OK ]');
        });

        it('should return correct prefix for warning', () => {
             expect(getLogStyles('warning').prefix).toBe('[ !! ]');
        });

        it('should return correct prefix for error', () => {
             expect(getLogStyles('error').prefix).toBe('[ CRIT ]');
        });
    });

    describe('getNotificationVariantForLogType', () => {
        it('should map types correctly', () => {
            expect(getNotificationVariantForLogType('info')).toBe('info');
            expect(getNotificationVariantForLogType('warning')).toBe('warning');
            expect(getNotificationVariantForLogType('error')).toBe('danger');
            expect(getNotificationVariantForLogType('vibration')).toBe('system');
            expect(getNotificationVariantForLogType('story')).toBe('default');
            expect(getNotificationVariantForLogType('levelup')).toBe('levelup');
        });

        it('should return default for unknown type', () => {
            expect(getNotificationVariantForLogType('unknown' as any)).toBe('default');
        });
    });
});
