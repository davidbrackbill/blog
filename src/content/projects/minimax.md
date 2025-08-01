---
title: "Minimax Solver"
description: "Solve and visualize a minimax game tree using alpha-beta pruning."
tech: ["Python", "AI"]
home_page: true
projects_page: true
resume_page: true
github: "https://github.com/davidbrackbill/minimax"
---
# About minimax

This algorithm is useful for choosing the best possible worst-case scenario, ie, if your opponent plays perfectly.

The game must be two-player, turn-based and have complete information, meaning that at any given state of the game, both players can see all endgames.

The alpha-beta optimization is an optional speedup to the minimax algorithm that skips subtrees that will not be chosen.

A sub-tree that will not be chosen is a simple scenario: if your opponent wants to minimize your gains, they will simply pick the subtree with the lowest expected score during their turn.

Therefore, we know that exploring that sub-tree any further is futile, it won't be chosen.

