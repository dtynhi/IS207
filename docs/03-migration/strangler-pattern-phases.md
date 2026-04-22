# Strangler Pattern Phases

1. Keep legacy app serving production traffic.
2. Build new API/frontend slices in parallel.
3. Route selected features to new stack using flags.
4. Expand migrated traffic slice-by-slice.
5. Decommission legacy handlers once parity and stability are confirmed.
