import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import localeFRCA from '@angular/common/locales/fr-CA';
import { registerLocaleData } from '@angular/common';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

// import { ComplianceTemplateSearchComponent } from './../compliance/compliance-template-search/compliance-template-search.component';
import { CustomFieldService } from './services/custom-field.service';
import { PhxCustomFieldValueComponent } from './components/phx-custom-field-value/phx-custom-field-value.component';
import { LookupNoCachePipe } from './pipes/lookup-no-cache.pipe';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { DatexPipe } from './pipes/Datex.pipe';
import { CookieModule } from 'ngx-cookie';
import { CookieService } from './services/cookie.service';
import { PhxTimeWithUnit } from './pipes/phx-time-with-unit.pipe';

import { PhxDialogCommentComponent } from './components/phx-dialog-comment/phx-dialog-comment.component';
import { WorkflowService } from './services/workflow.service';
import { CodeValueService } from './services/code-value.service';
import { DebounceDirective } from './directives/debounce.directive';
import { CommonService } from './services/common.service';
import { AggregateSummarizerService } from './services/aggregateSummarizer.service';
import { ChangeHistoryIsBlackFilterPipe } from './pipes/change-history-is-black-filter.pipe';
import { DataChangeTrackerApiService } from './services/data-change-tracker-api.service';
import { ChangeHistoryComponent } from './components/changeHistory/changeHistory.component';
import { PhxWorkflowEventHistoryComponent } from './components/phx-workflow-event-history/phx-workflow-event-history.component';
import { PhxValidationMessagesComponent } from './components/phx-validation-messages/phx-validation-messages.component';
import { PhxWorkflowButtonsComponent } from './components/phx-workflow-buttons/phx-workflow-buttons.component';
import { CodeValuePipe } from './pipes/code-value.pipe';
import { WindowRefService } from './services/WindowRef.service';
import { SortArrayOfObjectsPipe } from './pipes/sortArrayOfObjects.pipe';
import { pxPercentPipe } from './pipes/pxPercent.pipe';
import { pxCurrencyPipe } from './pipes/pxCurrency.pipe';
import { PercentFormatterDirective } from './directives/percentFormatter.directive';
import { CurrencyFormatterDirective } from './directives/currencyFormatter.directive';
import { FormModelDirective } from './directives/formModel.directive';
import {
  DxButtonModule,
  DxDataGridModule,
  DxPopupModule,
  DxTemplateModule,
  DxDateBoxModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxTextAreaModule,
  DxTemplateHost,
  WatcherHelper,
  DxRadioGroupModule,
  DxCalendarModule,
  DxTagBoxModule,
  DxTooltipModule
} from 'devextreme-angular';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DndModule } from 'ng2-dnd';
import { DocumentService } from './services/document.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PhxNavigationBarComponent } from './components/phx-navigation-bar/phx-navigation-bar.component';
import { PhxDataTableComponent } from './components/phx-data-table/phx-data-table.component';
import { PhxDataTableService } from './services/phx-data-table.service';
import { PhxDialogComponent } from './components/phx-dialog/phx-dialog.component';
import { PhxModalDatePickerComponent } from './components/phx-modal-date-picker/phx-modal-date-picker.component';
import { DialogService } from './services/dialog.service';
import { KeyValuePipe } from './pipes/key-value.pipe';
import { CollapseDirective } from './directives/collapse.directive';
import { PhxAccordionComponent } from './components/phx-accordion/phx-accordion.component';
import { PhxAccordionGroupComponent } from './components/phx-accordion-group/phx-accordion-group.component';
import { PhxTextareaExpandingComponent } from './components/phx-textarea-expanding/phx-textarea-expanding.component';
import { PhxBadgedAccordionGroupComponent } from './components/phx-badged-accordion-group/phx-badged-accordion-group.component';
import { PhxFormControlComponent } from './components/phx-form-control/phx-form-control.component';
import { PhxFormControlLabelComponent } from './components/phx-form-control/phx-form-control-label.component';
import { PhxFormControlValidationComponent } from './components/phx-form-control/phx-form-control-validation.component';
import { PhxSliderComponent } from './components/phx-slider/phx-slider.component';
import { PhxSelectComponent } from './components/phx-select/phx-select.component';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { PhxSelectFilterPipe } from './pipes/phx-select-filter.pipe';
import { NgSelectizeModule } from 'ng-selectize';
import { SelectModule } from 'ng2-select';
import { ReplaceHtmlBreakWithNewLinePipe } from './pipes/replace-html-break-with-new-line.pipe';
import { ReplaceNewLineWithHtmlBreakPipe } from './pipes/replace-new-line-with-html-break.pipe';
import { PhxDateBoxComponent } from './components/phx-date-box/phx-date-box.component';
import { PhxLocalizationPipe } from './pipes/phx-localization.pipe';
import { PhxInterceptPanelComponent } from './components/phx-intercept-panel/phx-intercept-panel.component';
import { PhxEntityDocumentsComponent } from './components/phx-entity-documents/phx-entity-documents.component';
import { PhxSelectBoxComponent } from './components/phx-select-box/phx-select-box.component';
import { PhxSelectBoxCodeValueComponent } from './components/phx-select-box-code-value/phx-select-box-code-value.component';
import { PhxSelectBoxBadgeComponent } from './components/phx-select-box-badge/phx-select-box-badge.component';
import { PhxBatchOperationButtonsComponent } from './components/phx-batch-operation-buttons/phx-batch-operation-buttons.component';
import { ReportService } from './services/report.service';
import { PhxPanelComponent } from './components/phx-panel/phx-panel.component';
import { PhxTagBoxComponent } from './components/phx-tag-box/phx-tag-box.component';
import { PhxFabComponent } from './components/phx-fab/phx-fab.component';
import { PendingChangesGuard } from './guards/pending-changes.guard';
import { PhxModalComponent } from './components/phx-modal/phx-modal.component';
import { PhxProfilePictureComponent } from './components/phx-profile-picture/phx-profile-picture.component';
import { PhxResponsiveButtonsComponent } from './components/phx-responsive-buttons/phx-responsive-buttons.component';
import { FloatBetweenInputDirective } from './directives/floatBetweenInput.directive';
import { PhxDisplayPercentWithDecimalsPipe } from './pipes/phx-display-percent-with-decimals.pipe';
import { FilterSelectChoicesByUsage } from './pipes/filterSelectChoicesByUsage.pipe';
import { InputTextLimitWithDecimalsDirective } from './directives/inputTextLimitWithDecimals.directive';
import { PhxStateActionButtonsComponent } from './components/phx-state-action-buttons/phx-state-action-buttons.component';
import { BoolToYesNoPipe } from './pipes/bool-to-yes-no.pipe';
import { PostalZipCodeValidDirective } from './directives/postalZipCodeValid.directive';
import { PhxAdvanceFilterComponent } from './components/phx-advance-filter/phx-advance-filter.component';
import { LookupPipe } from './pipes/lookup.pipe';
import { PhxDisplayCurrency } from './pipes/phxDisplayCurrency.pipe';
import { PhxCalendarComponent } from './components/phx-calendar/phx-calendar.component';
import { PhxEntityDocumentsListComponent } from './components/phx-entity-documents-list/phx-entity-documents-list.component';
import { BoolToTextPipe } from './pipes/bool-to-text.pipe';
import { PhxNotesComponent } from './components/phx-notes/phx-notes.component';
import { NoteService } from './services/note.service';
import { PhxNoteHeaderComponent } from './components/phx-note-header/phx-note-header.component';
import { PhxToolTipComponent } from './components/phx-tooltip/phx-tooltip.component';
import { EqualHeightDirective } from './directives/equalHeights.directive';

registerLocaleData(localeFRCA);
import { PxCurrencyFormatter } from './pipes/pxCurrencyFormatter.pipe';
import { UtilityService } from './services/utility-service.service';
import { StateService } from './state/state.module';
import { TurnoverFieldComponent } from './components/turnover-field/turnover-field.component';
import { LookupNoCachePipeImpure } from './pipes/lookup-no-cache-impure.pipe';
import { WBComponent } from './components/WorkflowButtons/WorkflowButtons.component';
import { GroupByPipe } from './pipes/groupby.pipe';
import { LoadingSpinnerComponent } from './loading-spinner/component/loading-spinner/loading-spinner.component';
import { LoadingSpinnerOverlayComponent } from './loading-spinner/component/loading-spinner-overlay/loading-spinner-overlay.component';
import { ToastrService } from './services/toastr.service';
import { PhxDialogErrorTemplateComponent } from './components/phx-dialog-error-template/phx-dialog-error-template.component';
import { PhxDialogNotifyTemplateComponent } from './components/phx-dialog-notify-template/phx-dialog-notify-template.component';
import { PhxDialogConfirmTemplateComponent } from './components/phx-dialog-confirm-template/phx-dialog-confirm-template.component';
import { PhxDialogWaitTemplateComponent } from './components/phx-dialog-wait-template/phx-dialog-wait-template.component';
import { PhxDialogCommentTemplateComponent } from './components/phx-dialog-comment-template/phx-dialog-comment-template.component';
import { PhxEntityDocumentsList2Component } from './components/phx-entity-documents-list2/phx-entity-documents-list2.component';
import { PhxProfilePictureCardComponent } from './components/phx-profile-picture-card/phx-profile-picture.component';
import { EllipsisTipDirective } from './directives/ellipsis-tip.directive';
import { TapGestureDirective } from './directives/press';
import { PhxStateHistoryComponent } from './components/phx-state-history/phx-state-history.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    HttpClientModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxPopupModule,
    DxTemplateModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxRadioGroupModule,
    DxCalendarModule,
    DxTagBoxModule,
    DndModule.forRoot(),
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    DatepickerModule.forRoot(),
    RouterModule,
    CookieModule.forRoot(),
    NgSelectizeModule,
    SelectModule,
    ReactiveFormsModule,
    DxTooltipModule
  ],
  declarations: [
    PhxLocalizationPipe,
    CodeValuePipe,
    PhxWorkflowButtonsComponent,
    PhxDialogCommentComponent,
    SortArrayOfObjectsPipe,
    pxPercentPipe,
    pxCurrencyPipe,
    ChangeHistoryIsBlackFilterPipe,
    PercentFormatterDirective,
    CurrencyFormatterDirective,
    FormModelDirective,
    PhxValidationMessagesComponent,
    PhxWorkflowEventHistoryComponent,
    ChangeHistoryComponent,
    PhxDialogComponent,
    DebounceDirective,
    PhxNavigationBarComponent,
    PhxDataTableComponent,
    PhxAccordionComponent,
    PhxAccordionGroupComponent,
    PhxBadgedAccordionGroupComponent,
    PhxSliderComponent,
    LookupNoCachePipe,
    PhxTextareaExpandingComponent,
    PhxSelectComponent,
    PhxFormControlComponent,
    PhxFormControlLabelComponent,
    PhxFormControlValidationComponent,
    PhxDateBoxComponent,
    PhxModalDatePickerComponent,
    DatexPipe,
    KeyValuePipe,
    CollapseDirective,
    ObjectFilterPipe,
    PhxSelectFilterPipe,
    PhxCustomFieldValueComponent,
    ReplaceHtmlBreakWithNewLinePipe,
    ReplaceNewLineWithHtmlBreakPipe,
    PhxInterceptPanelComponent,
    PhxEntityDocumentsComponent,
    // , ComplianceTemplateSearchComponent
    PhxSelectBoxComponent,
    PhxSelectBoxCodeValueComponent,
    PhxSelectBoxBadgeComponent,
    PhxBatchOperationButtonsComponent,
    PhxPanelComponent,
    PhxTagBoxComponent,
    PhxFabComponent,
    PhxModalComponent,
    PhxProfilePictureComponent,
    PhxResponsiveButtonsComponent,
    FloatBetweenInputDirective,
    PhxDisplayPercentWithDecimalsPipe,
    InputTextLimitWithDecimalsDirective,
    PhxStateActionButtonsComponent,
    PhxAdvanceFilterComponent,
    PhxNotesComponent,
    LookupPipe,
    PhxDisplayCurrency,
    FilterSelectChoicesByUsage,
    BoolToYesNoPipe,
    BoolToTextPipe,
    PostalZipCodeValidDirective,
    PhxCalendarComponent,
    PhxEntityDocumentsListComponent,
    PhxNoteHeaderComponent,
    PhxCalendarComponent,
    PhxEntityDocumentsListComponent,
    PxCurrencyFormatter,
    PhxToolTipComponent,
    TurnoverFieldComponent, // fix me
    LookupNoCachePipeImpure, // fix me
    WBComponent, // fix me
    GroupByPipe
    , LoadingSpinnerComponent // fix me
    , LoadingSpinnerOverlayComponent // fix me
    , PhxDialogErrorTemplateComponent
    , PhxDialogNotifyTemplateComponent
    , PhxDialogConfirmTemplateComponent
    , PhxDialogWaitTemplateComponent
    , PhxDialogCommentTemplateComponent
    , PhxEntityDocumentsList2Component
    , PhxStateHistoryComponent
    , PhxProfilePictureCardComponent
    , EllipsisTipDirective
    , TapGestureDirective
    , PhxTimeWithUnit
    , EqualHeightDirective
  ],
  exports: [
    PhxLocalizationPipe,
    DndModule,
    CodeValuePipe,
    PhxWorkflowButtonsComponent,
    PhxDialogCommentComponent,
    SortArrayOfObjectsPipe,
    pxPercentPipe,
    pxCurrencyPipe,
    ChangeHistoryIsBlackFilterPipe,
    PercentFormatterDirective,
    CurrencyFormatterDirective,
    FormModelDirective,
    PhxValidationMessagesComponent,
    PhxWorkflowEventHistoryComponent
    // , ComplianceTemplateSearchComponent
    , ChangeHistoryComponent
    , PhxModalDatePickerComponent
    , DebounceDirective
    , TooltipModule
    , PhxNavigationBarComponent
    , PhxDataTableComponent
    , PhxAccordionComponent
    , PhxAccordionGroupComponent
    , PhxBadgedAccordionGroupComponent
    , PhxTextareaExpandingComponent
    , PhxSelectComponent
    , PhxFormControlComponent
    , PhxFormControlLabelComponent
    , PhxFormControlValidationComponent
    , PhxSliderComponent
    , PhxDateBoxComponent
    , DatexPipe
    , PhxDialogComponent
    , DatepickerModule
    , KeyValuePipe
    , ObjectFilterPipe
    , PhxSelectFilterPipe
    , CollapseDirective
    , LookupNoCachePipe
    , PhxCustomFieldValueComponent
    , ReplaceHtmlBreakWithNewLinePipe
    , ReplaceNewLineWithHtmlBreakPipe
    , PhxInterceptPanelComponent
    , PhxEntityDocumentsComponent
    , PhxSelectBoxComponent
    , PhxSelectBoxCodeValueComponent
    , PhxSelectBoxBadgeComponent
    , PhxBatchOperationButtonsComponent
    , PhxPanelComponent
    , PhxTagBoxComponent
    , PhxFabComponent
    , PhxModalComponent
    , PhxProfilePictureComponent
    , PhxResponsiveButtonsComponent
    , FloatBetweenInputDirective
    , PhxDisplayPercentWithDecimalsPipe
    , FilterSelectChoicesByUsage
    , InputTextLimitWithDecimalsDirective
    , PhxStateActionButtonsComponent
    , PhxAdvanceFilterComponent
    , LookupPipe
    , PhxDisplayCurrency
    , BoolToYesNoPipe
    , BoolToTextPipe
    , PostalZipCodeValidDirective
    , PhxCalendarComponent
    , PhxEntityDocumentsListComponent
    , PhxNotesComponent
    , PhxNoteHeaderComponent
    , PhxCalendarComponent
    , PhxEntityDocumentsListComponent
    , PxCurrencyFormatter
    , PhxToolTipComponent
    , WBComponent // fix me
    , LoadingSpinnerComponent // fix me
    , LoadingSpinnerOverlayComponent // fix me
    , PhxDialogErrorTemplateComponent
    , PhxDialogNotifyTemplateComponent
    , PhxDialogConfirmTemplateComponent
    , PhxDialogWaitTemplateComponent
    , PhxDialogCommentTemplateComponent
    , PhxEntityDocumentsList2Component
    , PhxProfilePictureCardComponent
    , PhxStateHistoryComponent
    // pipes start from here
    , GroupByPipe
    , EllipsisTipDirective
    , TapGestureDirective
    , PhxTimeWithUnit
    , EqualHeightDirective
  ],
  providers: [
    CurrencyPipe,
    DocumentService,
    WorkflowService,
    CodeValueService,
    PhxDataTableService,
    DxTemplateHost,
    WatcherHelper,
    DialogService,
    AggregateSummarizerService,
    CustomFieldService,
    ReportService,
    PendingChangesGuard,
    CookieService,
    UtilityService,
    WindowRefService,
    CommonService,
    DataChangeTrackerApiService,
    pxPercentPipe,
    pxCurrencyPipe,
    PhxDataTableService,
    NoteService,
    ToastrService
  ],
  entryComponents: [PhxDialogErrorTemplateComponent, PhxDialogNotifyTemplateComponent, PhxDialogConfirmTemplateComponent, PhxDialogWaitTemplateComponent, PhxDialogCommentTemplateComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PhoenixCommonModule {
  // static forRoot() {
  //   return {
  //     ngModule: PhoenixCommonModule,
  //     providers: [
  //       WindowRefService,
  //       CommonService,
  //       DataChangeTrackerApiService,
  //       pxPercentPipe,
  //       pxCurrencyPipe,
  //       PhxDataTableService,
  //       NoteService
  //     ],
  //   };
  // }
}

export * from './utility/property';
export * from './utility/uuid';
export * from './model/phx-constants';
export * from './PhoenixCommonModule.resource-keys';
