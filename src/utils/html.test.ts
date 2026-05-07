import { stripHTMLTags, convertHTMLToMarkdown, extractHTMLAtSelector } from './html';

describe('stripHTMLTags', () => {
  it('removes HTML tags from a string', () => {
    expect(stripHTMLTags('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('compacts repeated spaces left by removed tags', () => {
    expect(stripHTMLTags('<p>Hello</p>   <p>world</p>')).toBe('Hello world');
  });

  it('returns plain text unchanged', () => {
    expect(stripHTMLTags('No tags here')).toBe('No tags here');
  });

  it('strips non-breaking spaces', () => {
    expect(stripHTMLTags('Hello&nbsp;world')).toBe('Hello world');
    expect(stripHTMLTags('Hello world')).toBe('Hello world');
  });
});

describe('convertHTMLToMarkdown', () => {
  it('converts bold tags to markdown', () => {
    expect(convertHTMLToMarkdown('<strong>bold</strong>')).toBe('**bold**');
  });

  it('converts anchor tags to markdown links', () => {
    expect(convertHTMLToMarkdown('<a href="https://example.com">Click here</a>')).toBe(
      '[Click here](https://example.com)'
    );
  });

  it('converts headings to markdown', () => {
    expect(convertHTMLToMarkdown('<h1>Title</h1>')).toBe('# Title');
  });
});

describe('extractHTMLAtSelector', () => {
  it('returns the innerHTML of the first matching node', () => {
    const html = '<div><p class="target">Hello <strong>world</strong></p></div>';
    expect(extractHTMLAtSelector(html, '.target')).toBe('Hello <strong>world</strong>');
  });

  it('returns the innerHTML of only the first match when multiple nodes match', () => {
    const html = '<ul><li>one</li><li>two</li><li>three</li></ul>';
    expect(extractHTMLAtSelector(html, 'li')).toBe('one');
  });

  it('returns an empty string when nothing matches the selector', () => {
    expect(extractHTMLAtSelector('<div><p>Hi</p></div>', '.missing')).toBe('');
  });

  it('returns an empty string when the matched node is empty', () => {
    expect(extractHTMLAtSelector('<div class="target"></div>', '.target')).toBe('');
  });
});
