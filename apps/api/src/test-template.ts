import { TemplateService } from './modules/notifications/template.service';

async function test() {
  const service = new TemplateService();

  // Mock data
  const data = {
    subject: 'Test Subject',
    name: 'Test User',
    verificationUrl: 'https://example.com/verify',
  };

  try {
    console.log('Rendering verify-email template...');
    const result = service.render('verify-email', 'email', data, 'html');
    console.log('---------------------------------------------------');
    console.log(result);
    console.log('---------------------------------------------------');

    if (
      result.includes('<!DOCTYPE html>') &&
      result.includes('Test Subject') &&
      result.includes('Test User')
    ) {
      console.log('SUCCESS: Template rendered correctly with layout');
    } else {
      console.error('FAILURE: Template output missing expected content');
    }
  } catch (error) {
    console.error('Error rendering template:', error);
  }
}

test();
