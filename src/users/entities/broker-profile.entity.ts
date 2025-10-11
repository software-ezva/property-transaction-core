import { ChildEntity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile, ProfileType } from './profile.entity';
import { Brokerage } from './brokerage.entity';

@ChildEntity(ProfileType.BROKER)
export class BrokerProfile extends Profile {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
    comment: 'Broker license number',
  })
  brokerLicenseNumber: string;

  @Column({
    type: 'date',
    nullable: true,
    comment: 'Date when broker license expires',
  })
  licenseExpirationDate: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'State where the broker is licensed',
  })
  licenseState: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Years of experience as a broker',
  })
  yearsOfExperience: number;

  @ManyToOne(() => Brokerage, (brokerage) => brokerage.brokers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'brokerageId' })
  brokerage: Brokerage;
}
