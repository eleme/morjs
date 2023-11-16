/**
 * Create condition helper.
 * Structure:
 *   <div1 x-if={a} />
 *   <div2 x-elseif={b} />
 *   <div3 x-else />
 *   =>
 *   [
 *     [
 *       () => a,
 *       () => <div1 />
 *     ],
 *     [
 *       () => b,
 *       () => <div1 />
 *     ],
 *     [
 *       () => true,
 *       () => <div1 />
 *     ]
 *   ]
 * @param conditions
 * @return {null}
 */
export default function createCondition(...conditions) {
  if (Array.isArray(conditions)) {
    for (let i = 1, l = conditions.length; i < l; i + 2) {
      const getCondition = conditions[i - 1]
      const renderView = conditions[i]
      if (getCondition()) return renderView
    }
  }
  return null
}
