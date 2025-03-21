import type { FlashListProps } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import { useHeaderTabContext } from '@showtime-xyz/tab-view';
import React from 'react';

import { TabFlashListScrollView } from './tab-flash-list-scroll-view';

export type TabFlashListProps<T> = Omit<
  FlashListProps<T>,
  'renderScrollComponent'
> & {
  index: number;
};

function TabFlashListComponent<T>(
  props: TabFlashListProps<T>,
  ref: React.Ref<FlashList<T>>
) {
  const { scrollViewPaddingTop } = useHeaderTabContext();
  return (
    <FlashList
      {...props}
      renderScrollComponent={TabFlashListScrollView as any}
      contentContainerStyle={{ paddingTop: scrollViewPaddingTop }}
      ref={ref}
    />
  );
}

export const TabFlashList = React.forwardRef(TabFlashListComponent) as <T>(
  props: TabFlashListProps<T> & {
    ref?: React.Ref<FlashList<T>>;
  }
) => React.ReactElement;
