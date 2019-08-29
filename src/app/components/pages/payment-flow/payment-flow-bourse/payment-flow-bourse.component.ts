import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {_} from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import {FormUtil} from '../../../../utils/form';
import {AuthenticationService} from '../../../../services/authentication.service';
import {User} from '../../../../models/user';
import {Coupon} from '../../../../models/coupon';
import {UserService} from '../../../../services/user.service';
import {MyCartService} from '../../../../services/my-cart/my-cart.service';
import {AppliedCoupon} from '../../../../models/appliedCoupon';
import {OrderService} from '../../../../services/order.service';

@Component({
  selector: 'app-payment-flow-bourse',
  templateUrl: './payment-flow-bourse.component.html',
  styleUrls: ['./payment-flow-bourse.component.scss']
})
export class PaymentFlowBourseComponent implements OnInit {

  haveGrantApplied = false;
  universityForm: FormGroup;
  universityErrors: string[];
  universityFields = [
    {
      name: 'coupon_code',
      type: 'text',
      label: _('retreat-cart.labels.grant_code')
    },
    {
      name: 'student_number',
      type: 'text',
      label: _('retreat-cart.labels.matricule')
    },
    {
      name: 'faculty',
      type: 'text',
      label: _('retreat-cart.labels.faculty')
    },
    {
      name: 'academic_program_code',
      type: 'text',
      label: _('retreat-cart.labels.program_code')
    }
  ];

  @Output() back: EventEmitter<any> = new EventEmitter<any>();
  @Output() forward: EventEmitter<any> = new EventEmitter<any>();

  constructor(private authenticationService: AuthenticationService,
              private userService: UserService,
              private cartService: MyCartService,
              private orderService: OrderService) { }

  ngOnInit() {
    this.initUniversityForm();
  }

  initUniversityForm() {
    const formUtil = new FormUtil();
    this.universityForm = formUtil.createFormGroup(this.universityFields);
    const profile = this.authenticationService.getProfile();
    const cart = this.cartService.getCart();
    if (cart) {
      const coupons = cart.getCoupons();
      if (coupons.length > 0) {
        this.universityForm.controls['coupon_code'].setValue(coupons[0].code);
      }
    }
    this.universityForm.controls['academic_program_code'].setValue(profile.academic_program_code);
    this.universityForm.controls['faculty'].setValue(profile.faculty);
    this.universityForm.controls['student_number'].setValue(profile.student_number);
  }

  submitUniversityInformation() {
    const temporaryCart = this.cartService.getCart();

    if (!this.haveGrantApplied) {
      this.haveGrantApplied = true;
      const value = new User({
        academic_program_code: this.universityForm.controls['academic_program_code'].value,
        faculty: this.universityForm.controls['faculty'].value,
        student_number: this.universityForm.controls['student_number'].value
      });
      const newCoupon = new Coupon({
          code: this.universityForm.controls['coupon_code'].value
        }
      );

      const profile = this.authenticationService.getProfile();
      this.userService.update(profile.url, value).subscribe(
        user => {
          this.authenticationService.setProfile(user);
          temporaryCart.addCoupon(newCoupon);
          this.refreshCouponUsage(temporaryCart);
        },
        err => {
          this.haveGrantApplied = false;
          if (err.error.non_field_errors) {
            this.universityErrors = err.error.non_field_errors;
          } else {
            this.universityErrors = ['shared.form.errors.unknown'];
          }
          this.universityForm = FormUtil.manageFormErrors(this.universityForm, err);
        }
      );
    }
  }

  canAddAGrant() {
    return FormUtil.isCompleted(this.universityForm, this.universityFields) && !this.haveGrantApplied;
  }

  goBack() {
    this.back.emit();
  }

  goForward() {
    this.submitUniversityInformation();
  }

  refreshCouponUsage(temporaryCart) {
    if (temporaryCart.getCoupons().length) {
      this.orderService.validate(temporaryCart.generateOrder()).subscribe(
        data => {
          this.cartService.addCoupon(temporaryCart.getCoupons()[0]);
          this.forward.emit();
        },
        err => {
          if (err.error.non_field_errors) {
            this.universityErrors = err.error.non_field_errors;
          } else if (err.error.coupon) {
            this.universityErrors = err.error.coupon[0];
          }
        }
      );
    } else {
      this.forward.emit();
    }
  }
}
