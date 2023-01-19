export default function removeBy<T = any>(
  array: T[],
  fn: (i: any) => boolean
): T[] {
  return array.filter((item) => !fn(item))
}
