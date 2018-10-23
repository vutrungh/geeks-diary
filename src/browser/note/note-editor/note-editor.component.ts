import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NoteSnippetListManager } from './note-snippet-list-manager';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './note-editor.component.html',
    styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent implements OnInit, OnDestroy {
    readonly titleInputControl = new FormControl('');

    @ViewChild('scrollable') scrollable: ElementRef<HTMLElement>;
    @ViewChild('snippetsList') snippetsList: ElementRef<HTMLElement>;
    @ViewChild('titleTextarea') titleTextarea: ElementRef<HTMLTextAreaElement>;

    private listTopFocusOutSubscription = Subscription.EMPTY;

    constructor(
        private snippetListManager: NoteSnippetListManager,
        private viewContainerRef: ViewContainerRef,
    ) {
    }

    ngOnInit(): void {
        this.snippetListManager
            .setContainerElement(this.snippetsList.nativeElement)
            .setViewContainerRef(this.viewContainerRef);

        this.listTopFocusOutSubscription = this.snippetListManager.topFocusOut()
            .subscribe(() => {
                if (this.titleTextarea) {
                    this.titleTextarea.nativeElement.focus();
                }
            });
    }

    ngOnDestroy(): void {
        this.listTopFocusOutSubscription.unsubscribe();
    }

    moveFocusToSnippetEditor(event: KeyboardEvent): void {
        event.preventDefault();
        this.snippetListManager.focusTo(0);
    }
}
