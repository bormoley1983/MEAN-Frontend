import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostsService } from 'src/app/services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit {
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
  ) {}
  private mode = 'create';
  private postId: string = '';
  post: Post = { id: null, title: '', content: '' };
  isLoading = false;

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = paramMap.get('postId');
      if (paramMap.has('postId') && typeof id === 'string') {
        this.mode = 'edit';
        this.postId = id;
        this.isLoading = true;
        // setTimeout(() => {
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.post = {
            id: postData.post.id,
            title: postData.post.title,
            content: postData.post.content,
          };
          this.isLoading = false;
        });
        // }, 5000);
      } else {
        this.mode = 'create';
        this.post = { id: null, title: '', content: '' };
        this.postId = '';
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(form.value.title, form.value.content);
    } else if (this.postId) {
      this.postsService.updatePost(
        this.postId,
        form.value.title,
        form.value.content,
      );
    }
    form.resetForm();
  }
}
