export class UnauthorizedItemUpdateDeletionException extends Error {
  constructor() {
    super('You can only delete your own updates');
  }
}
