import { describe, it } from 'vitest';
import { MailMessage } from '../../src/types';

describe('Performance Benchmark: Mail Filtering', () => {
    // Helper to generate data
    const generateMail = (count: number, startId: number): MailMessage[] => {
        return Array.from({ length: count }, (_, i) => ({
            id: `mail_${startId + i}`,
            from: 'sender',
            subject: `Subject ${startId + i}`,
            body: 'body',
            read: true,
        }));
    };

    const generateMailData = (count: number, startId: number): Omit<MailMessage, 'id' | 'read'>[] => {
        return Array.from({ length: count }, (_, i) => ({
            from: 'sender',
            subject: `Subject ${startId + i}`,
            body: 'body',
        }));
    };

    // Setup large datasets
    const existingMailCount = 10000;
    const existingMail = generateMail(existingMailCount, 0);

    // Using a moderate size for mailData to demonstrate the algorithmic difference
    const mailDataCount = 100;
    const mailData = generateMailData(mailDataCount, existingMailCount - 50); // 50 overlap, 50 new.

    it('benchmarks nested loop vs Set lookup', () => {
        const iterations = 20;
        let totalFoundCurrent = 0;
        let totalFoundOptimized = 0;

        // 1. Current Implementation
        const startCurrent = performance.now();
        for (let i = 0; i < iterations; i++) {
             const availableMail = mailData.filter(
                (m) => !existingMail.some((existing) => existing.subject === m.subject)
            );
            totalFoundCurrent += availableMail.length;
        }
        const endCurrent = performance.now();
        const timeCurrent = endCurrent - startCurrent;

        // 2. Optimized Implementation
        const startOptimized = performance.now();
        for (let i = 0; i < iterations; i++) {
             // Create Set once per tick/check
             const existingSubjects = new Set(existingMail.map((m) => m.subject));
             const availableMail = mailData.filter(
                (m) => !existingSubjects.has(m.subject)
             );
             totalFoundOptimized += availableMail.length;
        }
        const endOptimized = performance.now();
        const timeOptimized = endOptimized - startOptimized;

        console.log(`\n--- Mail Filtering Benchmark (${iterations} iterations) ---`);
        console.log(`Draft Mail Count: ${existingMailCount}`);
        console.log(`Mail Data Count: ${mailDataCount}`);
        console.log(`Current (Nested Loop): ${timeCurrent.toFixed(2)}ms`);
        console.log(`Optimized (Set): ${timeOptimized.toFixed(2)}ms`);
        console.log(`Improvement: ${(timeCurrent / timeOptimized).toFixed(2)}x`);
        console.log(`Total Found (Check): ${totalFoundCurrent} vs ${totalFoundOptimized}`);
    });
});
