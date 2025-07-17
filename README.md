# KIRO
試用 Amazon/AWS 團隊打造的 KIRO - AI 整合開發環境工具（IDE）。

## 計畫模式(Spec 推薦👍)
PROMPT: 幫我做一個 `todo list`
```bash
Kiro
Kiro uses generative AI. You may need to verify responses, code, and artifacts Kiro generates. See our Responsible AI Policy. Kiro processes data across all US Regions. Kiro may retain chats to provide and maintain the service.

Kiro may collect client-side telemetry and process content that may be used for service improvement. You can change this in Settings.

Kiro
我來幫你建立一個 todo list 功能的規格。首先讓我建立專案結構和需求文件。

Created

requirements.md


我已經為你的 todo list 功能建立了詳細的需求文件。這個需求涵蓋了一個完整的待辦事項應用程式的核心功能，包括：

新增、編輯、刪除待辦事項
標記任務完成狀態
過濾不同狀態的任務
顯示任務統計資訊
每個需求都包含了使用者故事和具體的驗收標準，確保功能的完整性和使用者體驗。

需求看起來如何？如果沒問題的話，我們可以繼續進行設計階段。
```
最先會幫你產生 `需求文件` 在 `.\.kiro\specs\todo-list\requirements.md` 的路徑。

## Move to design phase
再來會產生 `設計文件` 在 `.\.kiro\specs\todo-list\design.md` 的路徑。
```bash
improvement. You can change this in Settings.

Kiro
我來幫你建立一個 todo list 功能的規格。首先讓我建立專案結構和需求文件。

Created

requirements.md


我已經為你的 todo list 功能建立了詳細的需求文件。這個需求涵蓋了一個完整的待辦事項應用程式的核心功能，包括：

新增、編輯、刪除待辦事項
標記任務完成狀態
過濾不同狀態的任務
顯示任務統計資訊
每個需求都包含了使用者故事和具體的驗收標準，確保功能的完整性和使用者體驗。

需求看起來如何？如果沒問題的話，我們可以繼續進行設計階段。

很好！現在我來建立設計文件。讓我先研究一下最佳的 todo list 架構和實作方式。

基於現代 web 開發的最佳實踐，我會設計一個使用 React 和 TypeScript 的單頁應用程式，搭配本地儲存來持久化資料。這樣的架構既簡單又實用，適合個人使用的 todo list 應用。

Created

design.md


我已經建立了完整的設計文件，包含了：

技術架構：

使用 React + TypeScript 建構現代化前端應用
採用 Context API + useReducer 進行狀態管理
使用 localStorage 進行資料持久化
組件設計：

模組化的組件架構，每個組件都有明確的職責
包含主應用、表單、清單、項目、過濾器和統計等組件
資料模型：

清楚定義了 Todo 實體和相關的 TypeScript 類型
設計了完整的狀態管理和操作流程
品質保證：

完整的錯誤處理策略
詳細的測試計劃和覆蓋率目標
效能優化考量
設計看起來如何？如果沒問題的話，我們可以繼續建立實作計劃。
```

# Move to implementation plan
再來會產生 `實作計劃` 在 `\.kiro\specs\todo-list\tasks.md` 的路徑。
```bash
我來幫你建立一個 todo list 功能的規格。首先讓我建立專案結構和需求文件。

Created

requirements.md


我已經為你的 todo list 功能建立了詳細的需求文件。這個需求涵蓋了一個完整的待辦事項應用程式的核心功能，包括：

新增、編輯、刪除待辦事項
標記任務完成狀態
過濾不同狀態的任務
顯示任務統計資訊
每個需求都包含了使用者故事和具體的驗收標準，確保功能的完整性和使用者體驗。

需求看起來如何？如果沒問題的話，我們可以繼續進行設計階段。

很好！現在我來建立設計文件。讓我先研究一下最佳的 todo list 架構和實作方式。

基於現代 web 開發的最佳實踐，我會設計一個使用 React 和 TypeScript 的單頁應用程式，搭配本地儲存來持久化資料。這樣的架構既簡單又實用，適合個人使用的 todo list 應用。

Created

design.md


我已經建立了完整的設計文件，包含了：

技術架構：

使用 React + TypeScript 建構現代化前端應用
採用 Context API + useReducer 進行狀態管理
使用 localStorage 進行資料持久化
組件設計：

模組化的組件架構，每個組件都有明確的職責
包含主應用、表單、清單、項目、過濾器和統計等組件
資料模型：

清楚定義了 Todo 實體和相關的 TypeScript 類型
設計了完整的狀態管理和操作流程
品質保證：

完整的錯誤處理策略
詳細的測試計劃和覆蓋率目標
效能優化考量
設計看起來如何？如果沒問題的話，我們可以繼續建立實作計劃。

很好！現在我來建立詳細的實作任務清單。

Created

tasks.md


我已經建立了完整的實作計劃，包含 8 個主要階段和 15 個具體任務：

階段 1-2: 建立專案基礎

專案結構和類型定義
資料持久化工具
階段 3: 狀態管理系統

Context 和 Reducer 實作
自定義 Hook 封裝
階段 4: 核心 UI 組件

主應用組件
新增表單
清單容器
階段 5: 待辦事項操作

單個項目顯示
行內編輯功能
刪除功能
階段 6: 進階功能

過濾器
統計資訊
階段 7-8: 完善和優化

樣式和整合測試
效能優化
每個任務都明確指出了需要實作的具體功能，並且參照了對應的需求編號，確保所有需求都被涵蓋。

任務清單看起來如何？
```

## Finalize task list

```bash
我來幫你建立一個 todo list 功能的規格。首先讓我建立專案結構和需求文件。

Created

requirements.md


我已經為你的 todo list 功能建立了詳細的需求文件。這個需求涵蓋了一個完整的待辦事項應用程式的核心功能，包括：

新增、編輯、刪除待辦事項
標記任務完成狀態
過濾不同狀態的任務
顯示任務統計資訊
每個需求都包含了使用者故事和具體的驗收標準，確保功能的完整性和使用者體驗。

需求看起來如何？如果沒問題的話，我們可以繼續進行設計階段。

很好！現在我來建立設計文件。讓我先研究一下最佳的 todo list 架構和實作方式。

基於現代 web 開發的最佳實踐，我會設計一個使用 React 和 TypeScript 的單頁應用程式，搭配本地儲存來持久化資料。這樣的架構既簡單又實用，適合個人使用的 todo list 應用。

Created

design.md


我已經建立了完整的設計文件，包含了：

技術架構：

使用 React + TypeScript 建構現代化前端應用
採用 Context API + useReducer 進行狀態管理
使用 localStorage 進行資料持久化
組件設計：

模組化的組件架構，每個組件都有明確的職責
包含主應用、表單、清單、項目、過濾器和統計等組件
資料模型：

清楚定義了 Todo 實體和相關的 TypeScript 類型
設計了完整的狀態管理和操作流程
品質保證：

完整的錯誤處理策略
詳細的測試計劃和覆蓋率目標
效能優化考量
設計看起來如何？如果沒問題的話，我們可以繼續建立實作計劃。

很好！現在我來建立詳細的實作任務清單。

Created

tasks.md


我已經建立了完整的實作計劃，包含 8 個主要階段和 15 個具體任務：

階段 1-2: 建立專案基礎

專案結構和類型定義
資料持久化工具
階段 3: 狀態管理系統

Context 和 Reducer 實作
自定義 Hook 封裝
階段 4: 核心 UI 組件

主應用組件
新增表單
清單容器
階段 5: 待辦事項操作

單個項目顯示
行內編輯功能
刪除功能
階段 6: 進階功能

過濾器
統計資訊
階段 7-8: 完善和優化

樣式和整合測試
效能優化
每個任務都明確指出了需要實作的具體功能，並且參照了對應的需求編號，確保所有需求都被涵蓋。

任務清單看起來如何？

完美！Todo List 功能的規格文件已經完成。

你現在有了完整的：

需求文件 - 定義了 7 個主要需求和詳細的驗收標準
設計文件 - 包含技術架構、組件設計和資料模型
任務清單 - 15 個具體的實作任務，按邏輯順序排列
要開始實作，你可以：

打開 .kiro/specs/todo-list/tasks.md 檔案
點擊任務旁邊的「開始任務」按鈕來執行特定任務
建議從第一個任務「建立專案結構和核心類型定義」開始，這樣可以為後續的開發建立穩固的基礎。

需要我幫你開始執行任何特定的任務嗎？
```

## 執行任務
```bash
Execute Task: 1. 建立專案結構和核心類型定義 1. 建立專案結構和核心類型定義

Kiro
I'll implement the first task from the todo-list spec. Let me start by updating the task status and then implementing the project structure and core type definitions.

Task: 1. 建立專案結構和核心類型定義 from 
tasks.md
Status: In Progress
Now let me check the current project structure and then set up the React + TypeScript + Vite project.

Searched workspace
Check current project structure before setting up the React project
I'll create a React + TypeScript + Vite project structure. First, let me initialize the project with the necessary configuration files:

Created

package.json


Created

vite.config.ts


Created

tsconfig.json


Created

tsconfig.node.json


Now let me create the directory structure as specified in the design document:

Created

index.ts


Created

index.ts


Created

index.ts


Created

index.ts


Created

index.ts


Created

index.ts


Now let me create the core TypeScript type definitions as specified in the design document:

Created

todo.ts


Now let me create the remaining directory structure and placeholder files:

Created

TodoContext.tsx


Created

useTodos.ts


Created

storage.ts


Created

index.css


Now let me create the main entry point files:

Created

main.tsx


Created

index.html


Let me also create a Jest configuration file for testing:

Created

jest.config.js


Created

setupTests.ts


Now let me verify the project structure by listing the directories:

Searched workspace
Verify the complete project structure has been created
Perfect! Let me also verify that the TypeScript types are properly defined by checking the content:

Read file(s)

todo.ts
Now let me test that the TypeScript configuration is working by running a type check:

Command
npx tsc --noEmit
pm exec tsc --noEmit
Great! The TypeScript compilation passes without errors. Now let me update the task status to completed:

Task: 1. 建立專案結構和核心類型定義 from 
tasks.md
Status: Completed
Task Completed Successfully! ✅
I've successfully implemented the first task "建立專案結構和核心類型定義" with the following accomplishments:

✅ React + TypeScript + Vite Project Structure
Created package.json with all necessary dependencies for React 18, TypeScript, Vite, and testing
Set up vite.config.ts for the build system
Configured TypeScript with tsconfig.json and tsconfig.node.json
Created index.html as the entry point
✅ Directory Structure
Created the complete directory structure as specified in the design document:

src/
├── components/          # React components (TodoApp, TodoList, TodoItem, TodoForm, TodoFilter, TodoStats)
├── context/            # React Context (TodoContext.tsx)
├── hooks/              # Custom Hooks (useTodos.ts)
├── types/              # TypeScript type definitions (todo.ts)
├── utils/              # Utility functions (storage.ts)
└── styles/             # Style files (index.css)
✅ Core TypeScript Type Definitions
Defined all core interfaces and types in src/types/todo.ts:

Todo interface with id, title, completed, createdAt, updatedAt
FilterType for 'all' | 'active' | 'completed'
TodoState interface for application state
TodoAction union type for all state management actions
TodoStats interface for statistics display
✅ Testing Setup
Configured Jest with jest.config.js
Set up React Testing Library with setupTests.ts
Ready for unit and integration testing
✅ Requirements Verification
This implementation satisfies the specified requirements:

需求 1.1: Project structure supports adding new todos
需求 2.1: Structure supports displaying todo lists
需求 3.1: Types support toggling completion status
The project is now ready for the next task in the implementation plan. All TypeScript types compile successfully and the foundation is set for building the todo list application.


19 changes accepted
(
View all
)
Revert


package.json

vite.config.ts

tsconfig.json

tsconfig.node.json

index.ts

index.ts

index.ts

index.ts

index.ts

index.ts

todo.ts

TodoContext.tsx

useTodos.ts

storage.ts

index.css

main.tsx

index.html

jest.config.js

setupTests.ts
```