import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { TrackerNote } from './entities/tracker-note.entity';

@Injectable()
export class TrackerNoteRepository extends BaseRepository<TrackerNote> {
  constructor(dataSource: DataSource) {
    super(TrackerNote, dataSource.createEntityManager());
  }

  async findByTrackerId(trackerId: string): Promise<TrackerNote[]> {
    return this.find({ where: { trackerId } });
  }
}
