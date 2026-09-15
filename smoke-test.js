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
assert.deepEqual(resolveProfile('?share=%7B%22recipient%22%3A%22Divyanshu%20Ji%22%2C%22month%22%3A9%2C%22day%22%3A21%2C%22theme%22%3A%22forest%22%7D', null, { recipient: 'you', birthday: { month: 1, day: 1 }, theme: 'cherry' }, { cherry: true, forest: true }), {
  recipient: 'Divyanshu Ji',
  birthday: { month: 9, day: 21 },
  theme: 'forest'
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
