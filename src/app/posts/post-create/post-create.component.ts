import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/auth/auth.service';
import { PostsService } from 'src/app/posts/post.service';
import { Post } from '../../models/post.model';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
  standalone: false,
})
export class PostCreateComponent implements OnInit, OnDestroy {
  public mode = 'create';
  private postId: string = '';
  private authStatusSub?: Subscription;
  isLoading = false;
  imagePreview: string = '';
  post: Post = { id: null, title: '', content: '', imagePath: '', creator: '' };
  form: FormGroup = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    content: new FormControl('', { validators: [Validators.required] }),
    image: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [mimeType],
    }),
  });

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getAuthStatusListener().subscribe(authStatus => {
      this.isLoading = false;
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = paramMap.get('postId');
      if (paramMap.has('postId') && typeof id === 'string') {
        this.mode = 'edit';
        this.postId = id;
        this.isLoading = true;
        // setTimeout(() => {
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.post = {
            id: postData.post.id,
            title: postData.post.title,
            content: postData.post.content,
            imagePath: postData.post.imagePath,
            creator: postData.post.creator,
          };
          this.form = new FormGroup({
            title: new FormControl(this.post.title, {
              validators: [Validators.required, Validators.minLength(3)],
            }),
            content: new FormControl(this.post.content, {
              validators: [Validators.required],
            }),
            image: new FormControl(this.post.imagePath),
          });
          this.imagePreview = this.post.imagePath;
          this.isLoading = false;
        });
        // }, 5000);
      } else {
        this.mode = 'create';
        this.post = {
          id: null,
          title: '',
          content: '',
          imagePath: '',
          creator: '',
        };
        this.postId = '';

        this.form = new FormGroup({
          title: new FormControl('', {
            validators: [Validators.required, Validators.minLength(3)],
          }),
          content: new FormControl('', { validators: [Validators.required] }),
          image: new FormControl('', {
            validators: [Validators.required],
            asyncValidators: [mimeType],
          }),
        });
      }
    });
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else if (this.postId) {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub?.unsubscribe();
  }
}
