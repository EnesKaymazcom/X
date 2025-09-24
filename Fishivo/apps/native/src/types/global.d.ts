declare global {
  var __DEV__: boolean;
}

// React Native FlatList ScrollView props fix - DÜZELTME
declare module 'react-native' {
  interface FlatListProps<ItemT> {
    // Sadece eksik olan prop'ları ekle, duplicate yapma
    contentContainerStyle?: StyleProp<ViewStyle>;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    refreshControl?: React.ReactElement<RefreshControlProps>;
    onEndReached?: ((info: { distanceFromEnd: number }) => void) | null;
    onEndReachedThreshold?: number | null;
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
    maxToRenderPerBatch?: number;
    windowSize?: number;
    initialNumToRender?: number;
    updateCellsBatchingPeriod?: number;
    getItemLayout?: (data: ArrayLike<ItemT> | null | undefined, index: number) => { length: number; offset: number; index: number };
  }
}

export {};