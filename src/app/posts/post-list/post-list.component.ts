import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { PostsService } from 'src/app/posts/post.service';

import { AuthService } from '../../auth/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
  standalone: false,
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 3, 5];
  userIsAuthenticated = false;
  userId!: string;
  private postsSub!: Subscription;
  private authStatusSub!: Subscription;

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();

    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postsData: { posts: Post[]; totalPostsCount: number }) => {
        this.isLoading = false;
        this.posts = postsData.posts;
        this.totalPosts = postsData.totalPostsCount;
        console.log(
          'PostListComponent ngOnInit - posts updated:',
          postsData.posts
        );
      });
    this.userIsAuthenticated = this.authService.getAuthStatus();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthentificated => {
        this.userIsAuthenticated = isAuthentificated;
        this.userId = this.authService.getUserId();
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
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
