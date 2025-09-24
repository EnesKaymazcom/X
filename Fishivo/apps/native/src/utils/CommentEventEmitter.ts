import { DeviceEventEmitter } from 'react-native';

class CommentEventEmitter {
  private static instance: CommentEventEmitter;

  public static getInstance(): CommentEventEmitter {
    if (!CommentEventEmitter.instance) {
      CommentEventEmitter.instance = new CommentEventEmitter();
    }
    return CommentEventEmitter.instance;
  }

  public emitCommentAdded(postId: number, newCount: number, hasUserCommented: boolean) {
    DeviceEventEmitter.emit('commentAdded', { postId, newCount, hasUserCommented });
  }

  public emitCommentDeleted(postId: number, newCount: number, hasUserCommented: boolean) {
    DeviceEventEmitter.emit('commentDeleted', { postId, newCount, hasUserCommented });
  }

  public onCommentAdded(callback: (data: { postId: number; newCount: number; hasUserCommented: boolean }) => void) {
    const subscription = DeviceEventEmitter.addListener('commentAdded', callback);
    return () => subscription.remove();
  }

  public onCommentDeleted(callback: (data: { postId: number; newCount: number; hasUserCommented: boolean }) => void) {
    const subscription = DeviceEventEmitter.addListener('commentDeleted', callback);
    return () => subscription.remove();
  }
}

export default CommentEventEmitter.getInstance();