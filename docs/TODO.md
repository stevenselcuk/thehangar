# Todo

### Performance Considerations

**Optimization Strategies**:

1. **Lazy Load Event Chains**: Only load active chain data, not entire library
2. **Audio Context Pooling**: Reuse Web Audio API nodes, don't recreate per sound
3. **Memoize Complex Calculations**: Cache reputation score computations, weather effects
4. **Debounce Visual Effects**: Limit glitch animation frequency to 30 FPS
5. **IndexedDB for Logs**: Move large log arrays out of main state object

**Bundle Size Management**:

- Audio files: Use compressed OGG Vorbis, lazy load per location
- Event chain data: Code-split by level requirement
- NDT mini-game logic: Dynamic import on first use
