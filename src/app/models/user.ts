import BaseModel from './baseModel';

export interface IUserEdit {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  other_phone?: string;
  birthdate?: string;
  gender?: string;
  language?: string;
  academic_program_code?: string;
  faculty?: string;
  student_number?: string;
  personnal_restrictions?: string;
  city?: string;
  university?: any;
  hide_newsletter?: boolean;
}

export class User extends BaseModel {
  id: number;
  url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  other_phone: string;
  university: any;
  academic_field: any;
  academic_level: any;
  birthdate: string;
  gender: string;
  language: string;
  is_active: boolean;
  is_superuser: boolean;
  volunteer_for_workplace: string[];
  membership: any;
  membership_end: string;
  tickets: number;
  personnal_restrictions: string;
  city: string;
  student_number: string;
  faculty: string;
  academic_program_code: string;
  hide_newsletter: boolean;
  is_in_newsletter: boolean;
  number_of_free_virtual_retreat: number;

  getUniversity() {
    if (this.university) {
      return this.university.name;
    } else {
      return null;
    }
  }

  getTimeBeforeEndMembership() {
    if (this.membership_end) {
      const endMembership = new Date(this.membership_end);
      const now = Date.now();
      const delta = endMembership.getTime() - now;
      const result = Math.ceil(delta / 86400000);
      if (result >= 0) {
        return result;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  getBirthdate() {
    /* Since the birthdate have no timezone
       in the API we add our timezone in
       the UTC date to reverse the display timezone
    */
    const date = new Date(this.birthdate);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() + offset * 60000);
  }

  getFullName() {
    return this.first_name + ' ' + this.last_name;
  }

  get hasMembershipActive(): boolean{
   return this.getTimeBeforeEndMembership() > 0;
  }
}

