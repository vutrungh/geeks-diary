import { BACKSPACE, DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import { DomPortalOutlet } from '@angular/cdk/portal';
import { HostBinding, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NoteSnippetTypes } from '../../../core/note';


let uniqueId = 0;


/**
 * Configuration for note snippet editor.
 */
export class NoteSnippetEditorConfig {
    type: NoteSnippetTypes;
    indent?: number = 4;
    value: string = '';
    codeLanguage?: string | null = null;
    codeFileName?: string | null = null;
}


/**
 * Events for note snippet editor.
 */
export enum NoteSnippetEditorEventNames {
    REMOVE_THIS = 'noteSnippetEditorRemoveThis',
    SWITCH_SNIPPET_AFTER_THIS = 'noteSnippetEditorSwitchSnippetAfterThis',
    MOVE_FOCUS_TO_PREVIOUS = 'noteSnippetEditorMoveFocusToPrevious',
    MOVE_FOCUS_TO_NEXT = 'noteSnippetEditorMoveFocusToNext',
    VALUE_CHANGED = 'noteSnippetEditorValueChanged',
}


export type NoteSnippetEditorEvent =
    NoteSnippetEditorRemoveThisEvent
    | NoteSnippetEditorSwitchSnippetAfterThisEvent
    | NoteSnippetEditorMoveFocusToPreviousEvent
    | NoteSnippetEditorMoveFocusToNextEvent
    | NoteSnippetEditorValueChangedEvent;


interface NoteSnippetEditorEventInterface {
    readonly name: NoteSnippetEditorEventNames;
    readonly source: NoteSnippetEditorRef<any>;
    readonly payload?: any;
}


export class NoteSnippetEditorRemoveThisEvent implements NoteSnippetEditorEventInterface {
    readonly name = NoteSnippetEditorEventNames.REMOVE_THIS;

    constructor(public readonly source: NoteSnippetEditorRef<any>) {
    }
}


export class NoteSnippetEditorSwitchSnippetAfterThisEvent implements NoteSnippetEditorEventInterface {
    readonly name = NoteSnippetEditorEventNames.SWITCH_SNIPPET_AFTER_THIS;

    constructor(public readonly source: NoteSnippetEditorRef<any>) {
    }
}


export class NoteSnippetEditorMoveFocusToPreviousEvent implements NoteSnippetEditorEventInterface {
    readonly name = NoteSnippetEditorEventNames.MOVE_FOCUS_TO_PREVIOUS;

    constructor(public readonly source: NoteSnippetEditorRef<any>) {
    }
}


export class NoteSnippetEditorMoveFocusToNextEvent implements NoteSnippetEditorEventInterface {
    readonly name = NoteSnippetEditorEventNames.MOVE_FOCUS_TO_NEXT;

    constructor(public readonly source: NoteSnippetEditorRef<any>) {
    }
}


export class NoteSnippetEditorValueChangedEvent implements NoteSnippetEditorEventInterface {
    readonly name = NoteSnippetEditorEventNames.VALUE_CHANGED;

    constructor(
        public readonly source: NoteSnippetEditorRef<any>,
        public readonly payload: { value: string },
    ) {
    }
}


/**
 * Reference to a note snippet editor.
 */
export class NoteSnippetEditorRef<T extends NoteSnippetEditor> {
    /** Note snippet editor component instance. */
    componentInstance: T;

    /** Pane element portal. */
    panePortal: DomPortalOutlet;

    /** Pane element id. */
    paneElementId: string;

    readonly events = new Subject<NoteSnippetEditorEvent>();

    constructor(
        public _config: NoteSnippetEditorConfig,
        public readonly id: string = `note-snippet-editor-${uniqueId++}`,
    ) {
    }

    /**
     * After editor initialized.
     */
    afterInitialized(): Observable<void> {
        return this.componentInstance._afterInitialized.asObservable();
    }

    /**
     * After editor disposed.
     */
    afterDisposed(): Observable<void> {
        return this.componentInstance._afterDisposed.asObservable();
    }

    destroy(): void {
        this.componentInstance.dispose();
        this.events.complete();
    }
}


/**
 * Abstraction of note snippet editor.
 */
export abstract class NoteSnippetEditor<T = any> implements OnInit {
    abstract _editor: T;

    /** Subject for notifying that the editor has been initialized. */
    readonly _afterInitialized = new Subject<void>();

    /** Subject for notifying that the editor has been destroyed. */
    readonly _afterDisposed = new Subject<void>();

    protected constructor(
        public _ref: NoteSnippetEditorRef<any>,
        public _config: NoteSnippetEditorConfig,
    ) {
    }

    @HostBinding('id')
    get id(): string {
        return this._ref.id;
    }

    ngOnInit(): void {
        this.initialize();
    }

    /**
     * Call when component initialized.
     * Implementation should create editor in this method.
     */
    abstract initialize(): void;

    /** Call when component destroyed */
    abstract dispose?(): void;

    /** Focus editor manually */
    abstract focus(): void;

    /** Blur editor manually */
    abstract blur(): void;

    /** Get raw value of editor */
    abstract getRawValue(): string;

    /** Set raw value of editor */
    abstract setRawValue(value: string): void;

    /** Get code language id */
    getCodeLanguageId?(): string;

    /** Get code file name */
    getCodeFileName?(): string;

    /** Determine if current position is top */
    abstract isCurrentPositionTop(): boolean;

    /** Determine if current position is bottom */
    abstract isCurrentPositionBottom(): boolean;

    /** Set position to top */
    abstract setPositionToTop(): void;

    /** Set position to bottom */
    abstract setPositionToBottom(): void;

    /** Handle key down */
    protected onKeyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case BACKSPACE:
                if (this.getRawValue().trim() === '') {
                    this.emitEvent(new NoteSnippetEditorRemoveThisEvent(this._ref));
                }
                break;

            case UP_ARROW:
                if (this.isCurrentPositionTop()) {
                    this.emitEvent(new NoteSnippetEditorMoveFocusToPreviousEvent(this._ref));
                }
                break;

            case DOWN_ARROW:
                if (this.isCurrentPositionBottom()) {
                    this.emitEvent(new NoteSnippetEditorMoveFocusToNextEvent(this._ref));
                }
                break;

            case ENTER:
                if (event.shiftKey) {
                    event.preventDefault();
                    this.emitEvent(new NoteSnippetEditorSwitchSnippetAfterThisEvent(this._ref));
                }
        }
    }

    protected onValueChanged(): void {
    }

    protected emitEvent(event: NoteSnippetEditorEvent): void {
        this._ref.events.next(event);
    }
}
