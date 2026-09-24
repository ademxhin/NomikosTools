import sys
from pathlib import Path
import unittest
from decimal import Decimal

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sync_products import ProductRecord, build_indexes, match_product, normalize


def product(code, alternative, barcode):
    return ProductRecord(code, alternative, barcode, "Test", "Διαθέσιμο", Decimal("1"), Decimal("1.24"), None, "")


class MatchingTests(unittest.TestCase):
    def setUp(self):
        self.first = product("1", "MPN-1", "111")
        self.second = product("2", "MPN-2", "222")
        self.by_alt, self.by_barcode = build_indexes([self.first, self.second])

    def test_normalizes_integer_float(self):
        self.assertEqual(normalize(123.0), "123")

    def test_prefers_agreeing_mpn_and_ean(self):
        result = match_product("MPN-1", "111", self.by_alt, self.by_barcode)
        self.assertEqual(result.status, "MPN και EAN")
        self.assertEqual(result.product, self.first)

    def test_uses_mpn_when_ean_is_missing(self):
        result = match_product("MPN-2", "", self.by_alt, self.by_barcode)
        self.assertEqual(result.status, "MPN")
        self.assertEqual(result.product, self.second)

    def test_rejects_conflicting_identifiers(self):
        result = match_product("MPN-1", "222", self.by_alt, self.by_barcode)
        self.assertEqual(result.status, "Σύγκρουση MPN/EAN")
        self.assertIsNone(result.product)


if __name__ == "__main__":
    unittest.main()
