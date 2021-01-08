import { Query } from 'mongoose';

export class APIFeatures {
  constructor(private query: Query<any, any, any>, private queryStr: any) {}

  get getQuery() {
    return this.query;
  }

  // Filtering
  filter() {
    let queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Adv filtering
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    queryObj = JSON.parse(queryStr);

    this.query = this.query.find(queryObj);

    return this;
  }

  // Sorting
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default case
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Fields limits
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Default case
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = +this.queryStr.page! || 1;
    const limit = +this.queryStr.limit! || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;

    // TODO:
    // if (this.queryStr.page) {
    //   const toursNum = await this.query.countDocuments();
    //   if (skip >= toursNum) {
    //     throw Error
    //   }
    // }
  }
}
