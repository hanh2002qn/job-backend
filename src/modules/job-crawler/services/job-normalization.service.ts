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
      loc.includes('ho chi minh')
    )
      return City.HO_CHI_MINH;
    if (loc.includes('hà nội') || loc.includes('hanoi') || loc.includes('ha noi'))
      return City.HA_NOI;
    if (loc.includes('đà nẵng') || loc.includes('danang') || loc.includes('da nang'))
      return City.DA_NANG;
    if (loc.includes('cần thơ') || loc.includes('can tho')) return City.CAN_THO;
    if (loc.includes('hải phòng') || loc.includes('hai phong')) return City.HAI_PHONG;
    if (loc.includes('an giang') || loc.includes('angiang')) return City.AN_GIANG;
    if (
      loc.includes('bà rịa') ||
      loc.includes('vũng tàu') ||
      loc.includes('ba ria') ||
      loc.includes('vung tau')
    )
      return City.BA_RIA_VUNG_TAU;
    if (loc.includes('bắc giang') || loc.includes('bac giang')) return City.BAC_GIANG;
    if (loc.includes('bắc kạn') || loc.includes('bac kan')) return City.BAC_KAN;
    if (loc.includes('bạc liêu') || loc.includes('bac lieu')) return City.BAC_LIEU;
    if (loc.includes('bắc ninh') || loc.includes('bac ninh')) return City.BAC_NINH;
    if (loc.includes('bến tre') || loc.includes('ben tre')) return City.BEN_TRE;
    if (loc.includes('bình định') || loc.includes('binh dinh')) return City.BINH_DINH;
    if (loc.includes('bình dương') || loc.includes('binh duong')) return City.BINH_DUONG;
    if (loc.includes('bình phước') || loc.includes('binh phuoc')) return City.BINH_PHUOC;
    if (loc.includes('bình thuận') || loc.includes('binh thuan')) return City.BINH_THUAN;
    if (loc.includes('cà mau') || loc.includes('ca mau')) return City.CA_MAU;
    if (loc.includes('cao bằng') || loc.includes('cao bang')) return City.CAO_BANG;
    if (loc.includes('đắk lắk') || loc.includes('dak lak')) return City.DAK_LAK;
    if (loc.includes('đắk nông') || loc.includes('dak nong')) return City.DAK_NONG;
    if (loc.includes('điện biên') || loc.includes('dien bien')) return City.DIEN_BIEN;
    if (loc.includes('đồng nai') || loc.includes('dong nai')) return City.DONG_NAI;
    if (loc.includes('đồng tháp') || loc.includes('dong thap')) return City.DONG_THAP;
    if (loc.includes('gia lai') || loc.includes('gialai')) return City.GIA_LAI;
    if (loc.includes('hà giang') || loc.includes('ha giang')) return City.HA_GIANG;
    if (loc.includes('hà nam') || loc.includes('ha nam')) return City.HA_NAM;
    if (loc.includes('hà tĩnh') || loc.includes('ha tinh')) return City.HA_TINH;
    if (loc.includes('hải dương') || loc.includes('hai duong')) return City.HAI_DUONG;
    if (loc.includes('hậu giang') || loc.includes('hau giang')) return City.HAU_GIANG;
    if (loc.includes('hòa bình') || loc.includes('hoa binh')) return City.HOA_BINH;
    if (loc.includes('hưng yên') || loc.includes('hung yen')) return City.HUNG_YEN;
    if (loc.includes('khánh hòa') || loc.includes('khanh hoa') || loc.includes('nha trang'))
      return City.KHANH_HOA;
    if (loc.includes('kiên giang') || loc.includes('kien giang')) return City.KIEN_GIANG;
    if (loc.includes('kon tum') || loc.includes('kontum')) return City.KON_TUM;
    if (loc.includes('lai châu') || loc.includes('lai chau')) return City.LAI_CHAU;
    if (
      loc.includes('lâm đồng') ||
      loc.includes('lam dong') ||
      loc.includes('đà lạt') ||
      loc.includes('da lat')
    )
      return City.LAM_DONG;
    if (loc.includes('lạng sơn') || loc.includes('lang son')) return City.LANG_SON;
    if (loc.includes('lào cai') || loc.includes('lao cai')) return City.LAO_CAI;
    if (loc.includes('long an') || loc.includes('longan')) return City.LONG_AN;
    if (loc.includes('nam định') || loc.includes('nam dinh')) return City.NAM_DINH;
    if (loc.includes('nghệ an') || loc.includes('nghe an') || loc.includes('vinh'))
      return City.NGHE_AN;
    if (loc.includes('ninh bình') || loc.includes('ninh binh')) return City.NINH_BINH;
    if (loc.includes('ninh thuận') || loc.includes('ninh thuan')) return City.NINH_THUAN;
    if (loc.includes('phú thọ') || loc.includes('phu tho')) return City.PHU_THO;
    if (loc.includes('phú yên') || loc.includes('phu yen')) return City.PHU_YEN;
    if (loc.includes('quảng bình') || loc.includes('quang binh')) return City.QUANG_BINH;
    if (loc.includes('quảng nam') || loc.includes('quang nam')) return City.QUANG_NAM;
    if (loc.includes('quảng ngãi') || loc.includes('quang ngai')) return City.QUANG_NGAI;
    if (loc.includes('quảng ninh') || loc.includes('quang ninh')) return City.QUANG_NINH;
    if (loc.includes('quảng trị') || loc.includes('quang tri')) return City.QUANG_TRI;
    if (loc.includes('sóc trăng') || loc.includes('soc trang')) return City.SOC_TRANG;
    if (loc.includes('sơn la') || loc.includes('son la')) return City.SON_LA;
    if (loc.includes('tây ninh') || loc.includes('tay ninh')) return City.TAY_NINH;
    if (loc.includes('thái bình') || loc.includes('thai binh')) return City.THAI_BINH;
    if (loc.includes('thái nguyên') || loc.includes('thai nguyen')) return City.THAI_NGUYEN;
    if (loc.includes('thanh hóa') || loc.includes('thanh hoa')) return City.THANH_HOA;
    if (loc.includes('thừa thiên huế') || loc.includes('hue') || loc.includes('huế'))
      return City.THUA_THIEN_HUE;
    if (loc.includes('tiền giang') || loc.includes('tien giang')) return City.TIEN_GIANG;
    if (loc.includes('trà vinh') || loc.includes('tra vinh')) return City.TRA_VINH;
    if (loc.includes('tuyên quang') || loc.includes('tuyen quang')) return City.TUYEN_QUANG;
    if (loc.includes('vĩnh long') || loc.includes('vinh long')) return City.VINH_LONG;
    if (loc.includes('vĩnh phúc') || loc.includes('vinh phuc')) return City.VINH_PHUC;
    if (loc.includes('yên bái') || loc.includes('yen bai')) return City.YEN_BAI;
    if (loc.includes('toàn quốc') || loc.includes('nationwide') || loc.includes('tất cả'))
      return City.NATIONWIDE;

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
