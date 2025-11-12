# 修正内容サマリー

## 修正完了項目

### 1. UploadScene.tsx の画像アップロード失敗の修正 ✅

**問題点**:
- Supabase StorageのRLSポリシーで認証が必要
- ユーザーIDの確認が不足

**修正内容**:
- `src/lib/supabase.ts`の`uploadImage`関数にユーザー認証チェックを追加
- `src/components/UploadScene.tsx`に以下を追加:
  - 現在のユーザーIDを取得
  - カレンダーが現在のユーザーのものか確認
  - 自分のカレンダーにのみアップロード可能に

**修正ファイル**:
- `src/lib/supabase.ts`
- `src/components/UploadScene.tsx`

### 2. MyCalendar に日付数字を表示 ✅

**確認結果**:
- `CalendarDay`コンポーネントは既に日付数字を表示している（66行目）
- `MyCalendar`コンポーネントは`CalendarDay`を使用している
- 日付数字は既に表示されている

**補足**:
- `CalendarDay`コンポーネントは`dayNumber`プロパティを受け取り、中央に大きく表示
- `MyCalendar`で`CalendarDay`に`dayNumber`を渡しているため、表示は正常

### 3. 自分の過去投稿が正しく表示されるようにuser_idでフィルタ ✅

**問題点**:
- `CalendarGrid`でカレンダーを読み込む際、ユーザーIDの確認が不足
- 他人の非公開カレンダーも表示される可能性

**修正内容**:
- `src/components/CalendarGrid.tsx`に以下を追加:
  - 現在のユーザーIDを取得
  - カレンダーが現在のユーザーのものか、または公開されている場合のみ表示
  - 非公開の他人のカレンダーは空配列を設定

**修正ファイル**:
- `src/components/CalendarGrid.tsx`

## 修正詳細

### UploadScene.tsx
```typescript
// 追加: ユーザーIDの取得と確認
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

useEffect(() => {
  loadCurrentUser();
}, []);

async function loadCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  setCurrentUserId(user?.id || null);
}

// アップロード前にカレンダーの所有者を確認
if (calendar.creator_id !== currentUserId) {
  alert('You can only upload to your own calendar');
  return;
}
```

### CalendarGrid.tsx
```typescript
// 追加: ユーザーIDの取得
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

// カレンダー読み込み時にユーザーIDでフィルタ
if (currentUserId && calendar.creator_id === currentUserId) {
  // 自分のカレンダー: すべて表示
  setScenes(scenesRes.data || []);
} else if (calendar.is_public) {
  // 公開カレンダー: すべて表示
  setScenes(scenesRes.data || []);
} else {
  // 非公開の他人のカレンダー: 空
  setScenes([]);
}
```

### supabase.ts (uploadImage)
```typescript
// 追加: ユーザー認証チェック
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  alert('ログインが必要です');
  return null;
}
```

## 動作確認

1. **画像アップロード**
   - ログイン状態を確認
   - 自分のカレンダーにのみアップロード可能
   - エラーメッセージが適切に表示

2. **日付数字表示**
   - MyCalendarページで各日付に数字が表示される
   - CalendarDayコンポーネントが正しく動作

3. **過去投稿の表示**
   - 自分のカレンダーの投稿のみ表示
   - 公開カレンダーは全員が見られる
   - 非公開の他人のカレンダーは表示されない

## 注意事項

- Supabase Storageの`advent.pics`バケットが存在することを確認
- RLSポリシーが適切に設定されていることを確認
- ユーザーがログインしていることを確認

