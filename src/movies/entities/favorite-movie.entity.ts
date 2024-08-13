import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import User from '../../users/entities/user.entity';

@Entity('favorite_movies')
export default class FavoriteMovie {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  movieId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
