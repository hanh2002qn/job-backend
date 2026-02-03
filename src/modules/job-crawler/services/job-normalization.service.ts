import { Injectable, Logger } from '@nestjs/common';
import DOMPurify from 'isomorphic-dompurify';
import {
  City,
  Currency,
  Education,
  Gender,
  Industry,
  JobLevel,
  JobType,
} from '../../jobs/enums/job.enums';

@Injectable()
export class JobNormalizationService {
  private readonly logger = new Logger(JobNormalizationService.name);

  /**
   * Normalize job type to standard Enums
   */
  normalizeJobType(type: string | undefined): JobType {
    if (!type) return JobType.FULL_TIME;
    const t = type.toLowerCase();

    if (
      t.includes('toàn thời gian') ||
      t.includes('full-time') ||
      t.includes('fulltime') ||
      t.includes('chính thức')
    )
      return JobType.FULL_TIME;
    if (
      t.includes('bán thời gian') ||
      t.includes('part-time') ||
      t.includes('parttime') ||
      t.includes('part time')
    )
      return JobType.PART_TIME;
    if (t.includes('thực tập') || t.includes('intern') || t.includes('apprenticeship'))
      return JobType.INTERNSHIP;
    if (t.includes('tự do') || t.includes('freelance') || t.includes('freelancer'))
      return JobType.FREELANCE;
    if (t.includes('hợp đồng') || t.includes('contract') || t.includes('hợp đồng thời vụ'))
      return JobType.CONTRACT;
    if (t.includes('remote') || t.includes('từ xa')) return JobType.REMOTE;
    if (t.includes('hybrid')) return JobType.HYBRID;

    return JobType.FULL_TIME; // Default
  }

  /**
   * Normalize experience level to standard Enums
   */
  normalizeExperienceLevel(level: string | undefined): JobLevel {
    if (!level || level === 'Not specified') return JobLevel.NOT_SPECIFIED;
    const l = level.toLowerCase();

    if (
      l.includes('không yêu cầu kinh nghiệm') ||
      l.includes('no experience') ||
      l.includes('chưa có kinh nghiệm')
    )
      return JobLevel.FRESHER;
    if (l.includes('dưới 1 năm') || l.includes('0-1 year')) return JobLevel.FRESHER;
    if (l.includes('1 năm') || l.includes('1 year')) return JobLevel.JUNIOR;
    if (l.includes('2 năm') || l.includes('2 years')) return JobLevel.JUNIOR;

    if (l.includes('3 năm') || l.includes('3 years')) return JobLevel.MIDDLE;
    if (l.includes('4 năm') || l.includes('4 years')) return JobLevel.MIDDLE;

    if (l.includes('5 năm') || l.includes('5 years')) return JobLevel.SENIOR;
    if (
      l.includes('trên 5 năm') ||
      l.includes('5+ years') ||
      l.includes('6 năm') ||
      l.includes('7 năm')
    )
      return JobLevel.SENIOR;

    if (l.includes('freshman') || l.includes('fresher') || l.includes('sinh viên'))
      return JobLevel.FRESHER;
    if (l.includes('junior') || l.includes('nhân viên')) return JobLevel.JUNIOR;
    if (l.includes('senior') || l.includes('chuyên gia')) return JobLevel.SENIOR;
    if (l.includes('middle') || l.includes('mid-level') || l.includes('intermediate'))
      return JobLevel.MIDDLE;

    if (l.includes('lead') || l.includes('trưởng nhóm')) return JobLevel.LEAD;
    if (l.includes('manager') || l.includes('quản lý') || l.includes('trưởng phòng'))
      return JobLevel.MANAGER;
    if (l.includes('director') || l.includes('giám đốc')) return JobLevel.DIRECTOR;

    return JobLevel.NOT_SPECIFIED;
  }

  /**
   * Parse salary string into min, max, and currency Enum
   */
  parseSalary(salaryStr: string | undefined): { min: number; max: number; currency: Currency } {
    let currency = Currency.VND;
    if (
      !salaryStr ||
      salaryStr.toLowerCase().includes('thỏa thuận') ||
      salaryStr.toLowerCase().includes('negotiable')
    ) {
      return { min: 0, max: 0, currency };
    }

    let min = 0;
    let max = 0;

    const salaryLower = salaryStr.toLowerCase();

    // Determine currency
    if (salaryLower.includes('usd') || salaryLower.includes('$')) {
      currency = Currency.USD;
    } else if (salaryLower.includes('eur') || salaryLower.includes('€')) {
      currency = Currency.EUR;
    } else if (
      salaryLower.includes('jpy') ||
      salaryLower.includes('yen') ||
      salaryLower.includes('¥')
    ) {
      currency = Currency.JPY;
    }

    // Extract numbers
    const numbers = salaryStr.match(/[\d,.]+/g);
    if (numbers) {
      const parsedNumbers = numbers
        .map((n) => {
          let cleanN = n.replace(/,/g, '');
          if (currency === Currency.VND && cleanN.includes('.')) {
            if (cleanN.split('.').pop()?.length !== 3) {
              // likely decimal
            } else {
              cleanN = cleanN.replace(/\./g, '');
            }
          }
          return parseFloat(cleanN);
        })
        .filter((n) => !isNaN(n));

      if (parsedNumbers.length >= 2) {
        min = parsedNumbers[0];
        max = parsedNumbers[1];
      } else if (parsedNumbers.length === 1) {
        if (
          salaryLower.includes('trên') ||
          salaryLower.includes('từ') ||
          salaryLower.includes('>') ||
          salaryLower.includes('min')
        ) {
          min = parsedNumbers[0];
        } else if (
          salaryLower.includes('tới') ||
          salaryLower.includes('đến') ||
          salaryLower.includes('up to') ||
          salaryLower.includes('max') ||
          salaryLower.includes('<')
        ) {
          max = parsedNumbers[0];
        } else {
          min = parsedNumbers[0];
        }
      }
    }

    // Handle multipliers (Million, Triệu, etc.)
    if (currency === Currency.VND) {
      const isMillion = salaryLower.includes('triệu') || salaryLower.includes('tr');
      if (isMillion) {
        if (min > 0 && min < 1000) min *= 1000000;
        if (max > 0 && max < 1000) max *= 1000000;
      }
    }

    return { min, max, currency };
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHtml(html: string | undefined): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    }).trim();
  }

  /**
   * Normalize location (City level)
   */
  normalizeCity(location: string | undefined): City {
    if (!location) return City.NATIONWIDE;
    const loc = location.toLowerCase();

    if (
      loc.includes('hồ chí minh') ||
      loc.includes('hcm') ||
      loc.includes('sài gòn') ||
      loc.includes('district 1') ||
      loc.includes('quận 1')
    )
      return City.HO_CHI_MINH;
    if (
      loc.includes('hà nội') ||
      loc.includes('hn') ||
      loc.includes('ba đình') ||
      loc.includes('cầu giấy')
    )
      return City.HA_NOI;
    if (loc.includes('đà nẵng') || loc.includes('dn')) return City.DA_NANG;
    if (loc.includes('cần thơ')) return City.CAN_THO;
    if (loc.includes('hải phòng')) return City.HAI_PHONG;
    if (loc.includes('bình dương')) return City.BINH_DUONG;
    if (loc.includes('đồng nai')) return City.DONG_NAI;

    return City.OTHER;
  }

  /**
   * Normalize education level
   */
  normalizeEducation(education: string | undefined): Education {
    if (!education) return Education.NOT_REQUIRED;
    const e = education.toLowerCase();

    if (e.includes('tiến sĩ') || e.includes('phd') || e.includes('doctor')) return Education.PHD;
    if (e.includes('thạc sĩ') || e.includes('master')) return Education.MASTER;
    if (
      e.includes('đại học') ||
      e.includes('cử nhân') ||
      e.includes('university') ||
      e.includes('bachelor')
    )
      return Education.UNIVERSITY;
    if (e.includes('cao đẳng') || e.includes('college')) return Education.COLLEGE;
    if (e.includes('trung cấp') || e.includes('vocational')) return Education.VOCATIONAL;
    if (e.includes('thpt') || e.includes('high school') || e.includes('12/12'))
      return Education.HIGH_SCHOOL;
    if (e.includes('không yêu cầu') || e.includes('not required') || e.includes('không bắt buộc'))
      return Education.NOT_REQUIRED;

    return Education.OTHER;
  }

  /**
   * Normalize gender requirement
   */
  normalizeGender(gender: string | undefined): Gender {
    if (!gender) return Gender.ANY;
    const g = gender.toLowerCase();

    if (g.includes('nam') || g.includes('male')) return Gender.MALE;
    if (g.includes('nữ') || g.includes('female')) return Gender.FEMALE;

    return Gender.ANY;
  }

  /**
   * Normalize industry/field
   */
  normalizeIndustry(industry: string | undefined): Industry {
    if (!industry) return Industry.OTHER;
    const i = industry.toLowerCase();

    if (
      i.includes('it') ||
      i.includes('phần mềm') ||
      i.includes('software') ||
      i.includes('công nghệ') ||
      i.includes('technology')
    )
      return Industry.IT_SOFTWARE;
    if (
      i.includes('tài chính') ||
      i.includes('ngân hàng') ||
      i.includes('finance') ||
      i.includes('banking')
    )
      return Industry.FINANCE_BANKING;
    if (
      i.includes('kinh doanh') ||
      i.includes('marketing') ||
      i.includes('sales') ||
      i.includes('bán hàng')
    )
      return Industry.SALES_MARKETING;
    if (i.includes('sản xuất') || i.includes('manufacturing') || i.includes('nhà máy'))
      return Industry.MANUFACTURING;
    if (i.includes('giáo dục') || i.includes('education') || i.includes('đào tạo'))
      return Industry.EDUCATION;
    if (i.includes('y tế') || i.includes('healthcare') || i.includes('bệnh viện'))
      return Industry.HEALTHCARE;
    if (i.includes('bán lẻ') || i.includes('retail') || i.includes('cửa hàng'))
      return Industry.RETAIL;
    if (
      i.includes('logistics') ||
      i.includes('vận tải') ||
      i.includes('shipping') ||
      i.includes('giao nhận')
    )
      return Industry.LOGISTICS;
    if (i.includes('xây dựng') || i.includes('construction') || i.includes('bất động sản'))
      return Industry.CONSTRUCTION;

    return Industry.OTHER;
  }
}
