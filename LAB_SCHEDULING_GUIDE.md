# 🔬 Lab Scheduling & Room Optimization Guide (v4.0.0)

## Overview
Academic institutions face a significant challenge in managing specialized room resources (e.g., Computer Labs, IC Engines Labs). This guide explains how the **LLM-Augmented Scheduler** optimizes these resources through **Tag-Based Aliasing** and **Batch-Aware Allocation**.

## 🏷️ Tag-Based Room Aliasing
Instead of hardcoding room numbers, the system uses a more flexible "tag" system.

1.  **Room Tags**: Each `Room` object can have an array of tags (e.g., `["programming-lab", "shared-it"]`).
2.  **Course Requirements**: Each `Course` can specify a `requiredRoomTag`.
3.  **Optimization**: The scheduler matches requirements with tags, allowing the institution to change physical rooms without modifying course data.

## 🏛️ Room Resource Pools
Based on the **Matrusri Engineering College** dataset, the system manages a pool of 45+ rooms:

- **Lecture Halls**: Capacity 60-70 students.
- **Shared Laboratories**: Capacity 30 students per sub-lab.
- **Large Multipurpose Lab (M 202)**: Capacity 75+ students.

## 🔄 Laboratory Splitting Logic
When a batch size exceeds a single lab's capacity (30 students), the system implements adaptive grouping:

| Batch Size | Strategy | Room Allocation |
| :--- | :--- | :--- |
| **≤ 30 Students** | Single Session | 1 Small Lab (e.g., N 303) |
| **31 - 60 Students** | Dual Split | Lab A (Group 1) + Lab B (Group 2) |
| **61 - 90 Students** | Triple Split | Lab A + Lab B + Lab C |
| **> 90 Students** | Large Lab Mode | M 202 Multipurpose Lab |

### Global Room Recovery
**The Efficiency Multiplier**: When a batch moves to a laboratory, their dedicated "Home Classroom" is globally marked as **FREE** in the `ConflictMatrix`. The scheduler can then use this freed slot for other batches in the institution, maximizing overall room efficiency.

## 🛠️ Implementation Specs (v4.0.0)

### 1. Lab Session Format
In the generated timetable grid, labs are identified by:
- **Duration**: Exactly 2 continuous slots (120 minutes).
- **Span**: Represented as a `span: 2` object in the UI components for proper rendering.

### 2. Multi-Department Sharing
The system allows departments (e.g., IT and CME) to "borrow" each other's specialized lab resources if they share the same physical institution profile. This is managed by the `labScheduler.ts` service.

---
**Status:** ✅ Resource-Optimized  
**Architecture:** Enterprise Multi-Tenant  
**Date:** March 30, 2026
