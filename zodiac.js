/**
 * Birth sign (western zodiac) lookup.
 * Each sign has a glyph for the card badge and an element that colours the card.
 */
(function () {
  "use strict";

  // [sign, glyph, element, start "MM-DD"] in calendar order; a sign runs until the next one starts.
  const SIGNS = [
    ["Capricorn", "♑", "earth", "01-01"],
    ["Aquarius", "♒", "air", "01-20"],
    ["Pisces", "♓", "water", "02-19"],
    ["Aries", "♈", "fire", "03-21"],
    ["Taurus", "♉", "earth", "04-20"],
    ["Gemini", "♊", "air", "05-21"],
    ["Cancer", "♋", "water", "06-21"],
    ["Leo", "♌", "fire", "07-23"],
    ["Virgo", "♍", "earth", "08-23"],
    ["Libra", "♎", "air", "09-23"],
    ["Scorpio", "♏", "water", "10-23"],
    ["Sagittarius", "♐", "fire", "11-22"],
    ["Capricorn", "♑", "earth", "12-22"]
  ];

  /**
   * @param {string} birthday "MM-DD"
   * @returns {{name: string, glyph: string, element: string}}
   */
  function birthSign(birthday) {
    const key = String(birthday).slice(-5); // also accepts "YYYY-MM-DD"
    let match = SIGNS[0];
    for (const sign of SIGNS) {
      if (key >= sign[3]) match = sign;
    }
    // U+FE0E asks for the plain text glyph rather than a coloured emoji
    return { name: match[0], glyph: match[1] + "︎", element: match[2] };
  }

  window.birthSign = birthSign;
})();
