/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-04-06 10:23:47
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-06-19 17:35:33
 * @FilePath: \cps-blog\src\utils\jsUtils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Inspired by https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_sortby-and-_orderby
// export function sortBy<T>(
//   array: T[],
//   getter: (item: T) => string | number | boolean,
// ): T[] {
//   const sortedArray = [...array];
//   sortedArray.sort((a, b) =>
//     // eslint-disable-next-line no-nested-ternary
//     getter(a) > getter(b) ? 1 : getter(b) > getter(a) ? -1 : 0,
//   );
//   return sortedArray;
// }

export function sortBy<T>(
  array: T[],
  getter: (item: T) => number // 确保返回数字
): T[] {
  try{
    const sortedArray = [...array];

    sortedArray.sort((a, b) => {
      const indexA = getter(a);
      const indexB = getter(b);
  
      // 处理找不到索引的情况（-1）
      if (indexA === -1) return 1; // 将未找到的项排在最后
      if (indexB === -1) return -1;
  
      // 正常比较索引位置
      return indexA - indexB;
    });
  
    return sortedArray;
  }catch(err){
    console.log('11111111',err)
    return array;
  }

}

export function toggleListItem<T>(list: T[], item: T): T[] {
  const itemIndex = list.indexOf(item);
  if (itemIndex === -1) {
    return list.concat(item);
  }
  const newList = [...list];
  newList.splice(itemIndex, 1);
  return newList;
}
