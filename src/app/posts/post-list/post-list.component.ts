import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Post } from '../../models/post.model';
import { PostsService } from 'src/app/services/post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  private postsSub: Subscription = new Subscription();

  constructor(public postsService: PostsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts();
    console.log('PostListComponent ngOnInit - posts:', this.posts);

    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.isLoading = true;
        this.posts = posts;
        console.log('PostListComponent ngOnInit - posts updated:', posts);
      });
  }

  ngOnChanges() {
    console.log('PostListComponent ngOnChanges - posts:', this.posts);
    console.log('posts.length:', this.posts.length);
  }

  onDeletePost(postId: string) {
    this.postsService.deletePost(postId);
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }
}
