import { AppNextPage } from './app.po';

describe('app-next App', () => {
  let page: AppNextPage;

  beforeEach(() => {
    page = new AppNextPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
