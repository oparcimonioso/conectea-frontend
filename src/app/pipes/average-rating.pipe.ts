import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'averageRating',
  standalone: true // Adicione esta linha!
})
export class AverageRatingPipe implements PipeTransform {
  transform(reviews: any[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }
}