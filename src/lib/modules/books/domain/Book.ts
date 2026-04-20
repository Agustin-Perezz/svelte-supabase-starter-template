export interface BookProperties {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
}

export interface CreateBookParams {
  title: string;
  author: string;
}

export interface ReconstructBookParams {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
}

export class Book {
  // eslint-disable-next-line max-params
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _author: string,
    private readonly _createdAt: Date
  ) {}

  static create(params: CreateBookParams): Book {
    return new Book('', params.title.trim(), params.author.trim(), new Date());
  }

  static reconstruct(params: ReconstructBookParams): Book {
    return new Book(params.id, params.title, params.author, params.createdAt);
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get author() {
    return this._author;
  }
  get createdAt() {
    return this._createdAt;
  }

  toJSON() {
    return {
      id: this._id,
      title: this._title,
      author: this._author,
      createdAt: this._createdAt.toISOString()
    };
  }
}

export type BookDTO = ReturnType<Book['toJSON']>;
