import { ComponentState } from './ComponentState';
import { ObjectIcon } from '../../../core/model';
import { BrowserUtil, AttachmentUtil } from '../../../core/browser';

class ArticleAttachmentComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.attachment) {
            this.state.fileName = input.attachment.Filename;
            this.state.fileSize = typeof input.attachment.FilesizeRaw !== 'undefined' ?
                AttachmentUtil.getFileSize(input.attachment.FilesizeRaw) : input.attachment.Filesize;
            this.state.icon = this.getIcon(input.attachment);
        } else {
            this.state.fileName = input.fileName;
            this.state.fileSize = input.fileSize;
            this.state.icon = input.icon;
        }
    }

    private getIcon(attachment: any): ObjectIcon {
        const contentType = attachment.ContentType;
        if (contentType) {
            return new ObjectIcon('MIMEType', contentType);
        }
        return null;
    }

    public onClick(): void {
        (this as any).emit('fileClicked');
    }

}

module.exports = ArticleAttachmentComponent;
