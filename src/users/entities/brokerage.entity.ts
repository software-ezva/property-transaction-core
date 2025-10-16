import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { RealEstateAgentProfile } from './real-estate-agent-profile.entity';
import { BrokerProfile } from './broker-profile.entity';
import { SupportingProfessionalProfile } from './supporting-professional-profile.entity';

@Entity('brokerages')
export class Brokerage {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
    comment: 'Name of the brokerage company',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Physical address of the brokerage',
  })
  address: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'County where the brokerage is located',
  })
  county: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'City where the brokerage is located',
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'State abbreviation (e.g., CA, NY)',
  })
  state: string;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
    comment: 'Main phone number of the brokerage',
  })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Email address of the brokerage',
  })
  email: string;

  @OneToMany(() => RealEstateAgentProfile, (agent) => agent.brokerage)
  agents: RealEstateAgentProfile[];

  @OneToMany(() => BrokerProfile, (broker) => broker.brokerage)
  brokers: BrokerProfile[];

  @ManyToMany(
    () => SupportingProfessionalProfile,
    (supportingProfessional) => supportingProfessional.brokerages,
  )
  supportingProfessionals: SupportingProfessionalProfile[];

  @CreateDateColumn()
  createdAt: Date;
}
