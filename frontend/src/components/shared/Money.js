import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";
import { formatMoneyParts } from "../../i18n/currencies";
import RiyalMark from "./RiyalMark";

const MARKS = { riyal: RiyalMark };

/**
 * A price, with the currency symbol rendered as a glyph where one exists.
 *
 * The `price()` helper on useStoreSettings returns a string, which is all most
 * callers need but leaves no room for an SVG. This renders the same conversion
 * and the same symbol placement, and substitutes a drawn mark when the currency
 * has one.
 *
 * The digits are isolated with dir="ltr": in English the Arabic-script Gulf
 * symbols were being spliced into a left-to-right number inside one text node,
 * which lets the bidi algorithm reorder the two.
 */
export default function Money({ amount, className = "" }) {
  const { currency, locale } = useStoreSettings();
  const { digits, symbol, mark, trailing } = formatMoneyParts(amount, currency, locale);
  const Mark = mark ? MARKS[mark] : null;

  const glyph = Mark ? <Mark /> : symbol;
  const number = <bdi dir="ltr">{digits}</bdi>;

  return (
    <span className={className}>
      {trailing ? (
        <>
          {number} {glyph}
        </>
      ) : (
        <>
          {glyph}
          {number}
        </>
      )}
    </span>
  );
}
