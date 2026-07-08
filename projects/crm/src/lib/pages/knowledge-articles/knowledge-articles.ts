import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KnowledgeArticleService } from '../../services/knowledge-article.service';
import {
  KnowledgeArticleDto,
  CreateKnowledgeArticleDto,
  UpdateKnowledgeArticleDto,
  ArticleStatus,
  ArticleStatusLabels,
} from '../../models/knowledge-article.model';

@Component({
  selector: 'lib-knowledge-articles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './knowledge-articles.html',
  styleUrl: './knowledge-articles.css',
})
export class KnowledgeArticlesComponent implements OnInit {
  @ViewChild('bodyEditor') bodyEditorRef?: ElementRef<HTMLDivElement>;

  articles: KnowledgeArticleDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingArticle: KnowledgeArticleDto | null = null;
  viewingArticle: KnowledgeArticleDto | null = null;
  statusLabels = ArticleStatusLabels;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [10, 25, 50, 100];
  searchTerm      = '';

  private get _sortedArticles(): KnowledgeArticleDto[] {
    return [...this.articles].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  private get _searchFiltered(): KnowledgeArticleDto[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this._sortedArticles;
    return this._sortedArticles.filter(a =>
      `${a.title ?? ''} ${a.articleType ?? ''} ${a.categoryGroup ?? ''}`.toLowerCase().includes(q)
    );
  }

  get totalCount(): number { return this._searchFiltered.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize))); }
  get firstEntry(): number { return this.totalCount === 0 ? 0 : (this.page - 1) * Number(this.pageSize) + 1; }
  get lastEntry():  number { return Math.min(this.page * Number(this.pageSize), this.totalCount); }

  get filteredArticles(): KnowledgeArticleDto[] {
    const start = (this.page - 1) * Number(this.pageSize);
    return this._searchFiltered.slice(start, start + Number(this.pageSize));
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.cdr.detectChanges();
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.page = 1;
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.page = 1;
    this.cdr.detectChanges();
  }

  formTitle = '';
  formUrlName = '';
  formArticleType = '';
  formCategoryGroup = '';
  formSummary = '';
  formBody = '';
  formIsVisibleInApp = true;
  formIsVisibleInCsp = false;
  formIsVisibleInPkb = false;

  titleTouched = false;
  urlNameTouched = false;
  urlNameManuallyEdited = false;
  articleTypeTouched = false;
  categoryTouched = false;

  readonly articleTypeOptions = [
    'FAQ',
    'How-To',
    'Troubleshooting',
    'Best Practices',
    'Release Notes',
    'Policy',
    'Reference',
  ];

  readonly categoryOptions = [
    'General',
    'Sales',
    'Customer Support',
    'Technical',
    'Billing & Payments',
    'Product',
    'Onboarding',
  ];

  // Toolbar state
  isBold = false;
  isItalic = false;
  isUnderline = false;
  isStrike = false;
  isAlignLeft = false;
  isAlignCenter = false;
  isAlignRight = false;
  isAlignJustify = false;

  constructor(
    private articleService: KnowledgeArticleService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}

  get safeArticleBody(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.viewingArticle?.body ?? '');
  }

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.loading = true;
    this.error = '';
    this.articleService.getAll().subscribe({
      next: (res) => {
        this.articles = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load articles';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openArticleView(article: KnowledgeArticleDto) {
    this.viewingArticle = article;
    this.showForm = false;
  }

  closeArticleView() {
    this.viewingArticle = null;
  }

  openCreateForm() {
    this.editingArticle = null;
    this.viewingArticle = null;
    this.resetForm();
    this.showForm = true;
    setTimeout(() => this.initEditor(''));
  }

  openEditFormFromView() {
    if (this.viewingArticle) this.openEditForm(this.viewingArticle);
  }

  openEditForm(article: KnowledgeArticleDto) {
    this.viewingArticle = null;
    this.editingArticle = article;
    this.formTitle = article.title ?? '';
    this.formUrlName = article.urlName ?? '';
    this.formArticleType = article.articleType ?? '';
    this.formCategoryGroup = article.categoryGroup ?? '';
    this.formSummary = article.summary ?? '';
    this.formBody = article.body ?? '';
    this.formIsVisibleInApp = article.isVisibleInApp ?? true;
    this.formIsVisibleInCsp = article.isVisibleInCsp ?? false;
    this.formIsVisibleInPkb = article.isVisibleInPkb ?? false;
    this.titleTouched = false;
    this.urlNameTouched = false;
    this.urlNameManuallyEdited = true;
    this.articleTypeTouched = false;
    this.categoryTouched = false;
    this.showForm = true;
    setTimeout(() => this.initEditor(this.formBody));
  }

  private initEditor(content: string) {
    if (this.bodyEditorRef) {
      this.bodyEditorRef.nativeElement.innerHTML = content;
      this.bodyEditorRef.nativeElement.focus();
    }
  }

  onBodyInput(event: Event) {
    this.formBody = (event.target as HTMLDivElement).innerHTML;
  }

  execFormat(command: string, value?: string) {
    document.execCommand(command, false, value ?? '');
    this.bodyEditorRef?.nativeElement.focus();
    this.updateToolbarState();
  }

  updateToolbarState() {
    this.isBold      = document.queryCommandState('bold');
    this.isItalic    = document.queryCommandState('italic');
    this.isUnderline = document.queryCommandState('underline');
    this.isStrike    = document.queryCommandState('strikethrough');
    this.isAlignLeft    = document.queryCommandState('justifyLeft');
    this.isAlignCenter  = document.queryCommandState('justifyCenter');
    this.isAlignRight   = document.queryCommandState('justifyRight');
    this.isAlignJustify = document.queryCommandState('justifyFull');
    this.cdr.detectChanges();
  }

  onTitleChange() {
    if (!this.urlNameManuallyEdited) {
      this.formUrlName = this.formTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }
  }

  resetForm() {
    this.formTitle = '';
    this.formUrlName = '';
    this.formArticleType = '';
    this.formCategoryGroup = '';
    this.formSummary = '';
    this.formBody = '';
    this.formIsVisibleInApp = true;
    this.formIsVisibleInCsp = false;
    this.formIsVisibleInPkb = false;
    this.titleTouched = false;
    this.urlNameTouched = false;
    this.urlNameManuallyEdited = false;
    this.articleTypeTouched = false;
    this.categoryTouched = false;
    this.isBold = this.isItalic = this.isUnderline = this.isStrike = false;
    this.isAlignLeft = this.isAlignCenter = this.isAlignRight = this.isAlignJustify = false;
  }

  cancelForm() {
    this.showForm = false;
    this.editingArticle = null;
    this.resetForm();
  }

  saveArticle() {
    if (this.editingArticle) {
      const dto: UpdateKnowledgeArticleDto = {
        title: this.formTitle,
        urlName: this.formUrlName,
        articleType: this.formArticleType,
        categoryGroup: this.formCategoryGroup,
        summary: this.formSummary,
        body: this.formBody,
        isVisibleInApp: this.formIsVisibleInApp,
        isVisibleInCsp: this.formIsVisibleInCsp,
        isVisibleInPkb: this.formIsVisibleInPkb,
      };
      this.articleService.update(this.editingArticle.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadArticles(); },
        error: () => { this.error = 'Failed to update article'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateKnowledgeArticleDto = {
        title: this.formTitle,
        urlName: this.formUrlName,
        articleType: this.formArticleType,
        categoryGroup: this.formCategoryGroup,
        summary: this.formSummary,
        body: this.formBody,
        isVisibleInApp: this.formIsVisibleInApp,
        isVisibleInCsp: this.formIsVisibleInCsp,
        isVisibleInPkb: this.formIsVisibleInPkb,
      };
      this.articleService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadArticles(); },
        error: () => { this.error = 'Failed to create article'; this.cdr.detectChanges(); },
      });
    }
  }

  publishArticle(id: string) {
    if (!confirm('Publish this article?')) return;
    this.articleService.publish(id).subscribe({
      next: () => this.loadArticles(),
      error: () => { this.error = 'Failed to publish article'; this.cdr.detectChanges(); },
    });
  }

  archiveArticle(id: string) {
    if (!confirm('Archive this article?')) return;
    this.articleService.archive(id).subscribe({
      next: () => this.loadArticles(),
      error: () => { this.error = 'Failed to archive article'; this.cdr.detectChanges(); },
    });
  }

  deleteArticle(id: string) {
    if (!confirm('Delete this article?')) return;
    this.articleService.delete(id).subscribe({
      next: () => this.loadArticles(),
      error: () => { this.error = 'Failed to delete article'; this.cdr.detectChanges(); },
    });
  }
}
