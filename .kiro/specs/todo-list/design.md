# 設計文件

## 概述

Todo List 應用程式將使用 React 和 TypeScript 建構，採用現代化的前端架構。應用程式將使用瀏覽器的 localStorage 來持久化資料，確保使用者的待辦事項在重新載入頁面後仍然保存。

整體設計遵循單一職責原則和關注點分離，將 UI 組件、狀態管理和資料持久化分開處理。

## 架構

### 技術棧
- **前端框架**: React 18 with TypeScript
- **狀態管理**: React Context API + useReducer
- **樣式**: CSS Modules 或 Styled Components
- **資料持久化**: Browser localStorage
- **建構工具**: Vite
- **測試**: Jest + React Testing Library

### 架構模式
採用 Flux 架構模式，使用 React 的 Context API 和 useReducer 來管理全域狀態：

```
View (Components) → Actions → Reducer → State → View
```

### 目錄結構
```
src/
├── components/          # React 組件
│   ├── TodoApp/        # 主應用程式組件
│   ├── TodoList/       # 待辦事項清單組件
│   ├── TodoItem/       # 單個待辦事項組件
│   ├── TodoForm/       # 新增/編輯表單組件
│   ├── TodoFilter/     # 過濾器組件
│   └── TodoStats/      # 統計資訊組件
├── context/            # React Context
│   └── TodoContext.tsx
├── hooks/              # 自定義 Hooks
│   └── useTodos.ts
├── types/              # TypeScript 類型定義
│   └── todo.ts
├── utils/              # 工具函數
│   └── storage.ts
└── styles/             # 樣式檔案
```

## 組件和介面

### 核心資料類型

```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type FilterType = 'all' | 'active' | 'completed';

interface TodoState {
  todos: Todo[];
  filter: FilterType;
}

type TodoAction = 
  | { type: 'ADD_TODO'; payload: { title: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'UPDATE_TODO'; payload: { id: string; title: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'SET_FILTER'; payload: { filter: FilterType } }
  | { type: 'LOAD_TODOS'; payload: { todos: Todo[] } };
```

### 組件架構

#### TodoApp (主組件)
- 負責整體佈局和狀態提供
- 包含 TodoProvider 來提供全域狀態
- 渲染所有子組件

#### TodoForm (新增表單)
- 處理新待辦事項的輸入
- 表單驗證和提交
- 支援 Enter 鍵快速新增

#### TodoList (清單容器)
- 渲染過濾後的待辦事項清單
- 處理空狀態顯示
- 管理清單的整體佈局

#### TodoItem (單個項目)
- 顯示單個待辦事項
- 處理完成狀態切換
- 支援行內編輯功能
- 包含刪除確認機制

#### TodoFilter (過濾器)
- 提供過濾選項 (全部/未完成/已完成)
- 高亮當前選中的過濾器
- 處理過濾狀態變更

#### TodoStats (統計資訊)
- 顯示總任務數、已完成數、未完成數
- 即時更新統計資料
- 提供進度百分比顯示

### 狀態管理

使用 React Context API 配合 useReducer 來管理全域狀態：

```typescript
const TodoContext = createContext<{
  state: TodoState;
  dispatch: Dispatch<TodoAction>;
} | null>(null);
```

### 自定義 Hooks

#### useTodos
- 封裝 TodoContext 的使用
- 提供便利的操作方法
- 處理錯誤狀態

```typescript
const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider');
  }
  
  return {
    todos: context.state.todos,
    filter: context.state.filter,
    addTodo: (title: string) => context.dispatch({ type: 'ADD_TODO', payload: { title } }),
    toggleTodo: (id: string) => context.dispatch({ type: 'TOGGLE_TODO', payload: { id } }),
    updateTodo: (id: string, title: string) => context.dispatch({ type: 'UPDATE_TODO', payload: { id, title } }),
    deleteTodo: (id: string) => context.dispatch({ type: 'DELETE_TODO', payload: { id } }),
    setFilter: (filter: FilterType) => context.dispatch({ type: 'SET_FILTER', payload: { filter } })
  };
};
```

## 資料模型

### Todo 實體
- **id**: 唯一識別符 (UUID)
- **title**: 任務標題 (必填，最大長度 200 字元)
- **completed**: 完成狀態 (布林值)
- **createdAt**: 建立時間
- **updatedAt**: 最後更新時間

### 過濾器狀態
- **all**: 顯示所有任務
- **active**: 只顯示未完成任務
- **completed**: 只顯示已完成任務

### 本地儲存結構
```json
{
  "todos": [
    {
      "id": "uuid-string",
      "title": "任務標題",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "filter": "all"
}
```

## 錯誤處理

### 輸入驗證
- 空白標題檢查
- 標題長度限制
- 特殊字元處理

### 儲存錯誤
- localStorage 容量限制處理
- 資料序列化/反序列化錯誤
- 瀏覽器相容性問題

### 使用者體驗
- 載入狀態指示器
- 錯誤訊息顯示
- 操作確認對話框

## 測試策略

### 單元測試
- 所有 React 組件的渲染測試
- 使用者互動測試 (點擊、輸入、提交)
- Reducer 函數的邏輯測試
- 工具函數測試

### 整合測試
- 組件間的資料流測試
- Context Provider 和 Consumer 的整合
- localStorage 操作測試

### 端到端測試場景
- 新增待辦事項流程
- 編輯和刪除操作
- 過濾器功能
- 資料持久化驗證

### 測試覆蓋率目標
- 組件測試覆蓋率 > 90%
- 業務邏輯測試覆蓋率 > 95%
- 關鍵路徑 100% 覆蓋

### 效能考量
- 使用 React.memo 優化不必要的重新渲染
- 實作虛擬滾動 (如果待辦事項數量很大)
- 防抖輸入處理
- 延遲載入非關鍵組件