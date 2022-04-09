class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Build the query
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);
    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj).replace(
      /\bgte|gt|lte|lt\b/g,
      (match) => `$${match}`
    );

    // console.log(req.query);
    // const tours = await Tour.find(queryObj);
    // 2) Advanced query
    // let query = Tour.find().find(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      // sortBy = ('price ratingsAverage')
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 3) Fields limiting

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      // replaceAll(',', ' ').trim();
      this.query = this.query.select(fields);
      // console.log(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page could not be found');
    // }
    return this;
  }
}

module.exports = APIFeatures;
