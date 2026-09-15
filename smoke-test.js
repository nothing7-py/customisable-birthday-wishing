const assert = require('node:assert/strict');
const { resolveProfile, normalizeBirthday, normalizeRecipient, normalizeTheme, encodeProfileShare, decodeProfileShare } = require('./profile-utils.js');

assert.deepEqual(normalizeBirthday({ month: '7', day: '24' }), { month: 7, day: 24 });
assert.equal(normalizeRecipient('  Asha  '), 'Asha');
assert.equal(normalizeTheme('ocean', 'cherry', { cherry: true, ocean: true }), 'ocean');

const encoded = encodeProfileShare({ recipient: 'Asha', month: 7, day: 24, theme: 'ocean' });
assert.equal(typeof encoded, 'string');
assert.deepEqual(decodeProfileShare(encoded), { recipient: 'Asha', month: 7, day: 24, theme: 'ocean' });
assert.deepEqual(resolveProfile(`?share=${encoded}`, { recipient: 'Default', birthday: { month: 8, day: 9 }, theme: 'cherry' }, { recipient: 'you', birthday: { month: 1, day: 1 }, theme: 'cherry' }, { cherry: true, ocean: true }), {
  recipient: 'Asha',
  birthday: { month: 7, day: 24 },
  theme: 'ocean'
});
assert.deepEqual(resolveProfile('?recipient=Asha&month=7&day=24&theme=ocean', { recipient: 'Default', birthday: { month: 8, day: 9 }, theme: 'cherry' }, { recipient: 'you', birthday: { month: 1, day: 1 }, theme: 'cherry' }, { cherry: true, ocean: true }), {
  recipient: 'Asha',
  birthday: { month: 7, day: 24 },
  theme: 'ocean'
});
assert.deepEqual(resolveProfile('', { recipient: 'Default', birthday: { month: 8, day: 9 } }), {
  recipient: 'Default',
  birthday: { month: 8, day: 9 },
  theme: 'cherry'
});

console.log('smoke-test passed');
