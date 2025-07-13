import { Pipe, PipeTransform } from '@angular/core';

interface Review {
  rating: number;
}

@Pipe({ name: 'averageRating' })
export class AverageRatingPipe implements PipeTransform {
  transform(reviews: Review[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }
}