import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Post } from '../../models/post.model';
import { PostsService } from 'src/app/services/post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.scss'],
    standalone: false
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 3, 5];
  private postsSub: Subscription = new Subscription();

  constructor(public postsService: PostsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    console.log('PostListComponent ngOnInit - posts:', this.posts);

    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postsData: {posts: Post[], totalPostsCount: number } ) => {
        this.isLoading = false;
        this.posts = postsData.posts;
        this.totalPosts = postsData.totalPostsCount;
        console.log('PostListComponent ngOnInit - posts updated:', postsData.posts);
      });
  }

  onChangePagination(pageData: PageEvent) {
    this.isLoading = true;   
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDeletePost(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }
}
