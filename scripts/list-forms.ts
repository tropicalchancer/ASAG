import axios, { AxiosError } from 'axios';

async function getAccessToken(): Promise<string> {
  const response = await axios.post(
    'https://api.goformz.com/oauth/token',
    {
      grant_type: 'password',
      username: process.env.GOFORMZ_USERNAME,
      password: process.env.GOFORMZ_PW
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.access_token;
}

async function listTemplatesAndForms() {
  try {
    // Get access token
    const token = await getAccessToken();
    console.log('Got access token');

    // First get all templates
    console.log('\nFetching templates...');
    const templatesResponse = await axios.get(
      'https://api.goformz.com/v2/templates',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\nAvailable templates:');
    console.log(JSON.stringify(templatesResponse.data, null, 2));

    // Get forms for each template
    for (const template of templatesResponse.data) {
      console.log(`\nFetching forms for template: ${template.name} (${template.id})`);
      try {
        const formsResponse = await axios.get(
          `https://api.goformz.com/v2/templates/${template.id}/formz`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            params: {
              status: 'complete',
              take: '5' // Just get the 5 most recent forms
            }
          }
        );

        console.log('Recent forms:');
        console.log(JSON.stringify(formsResponse.data, null, 2));
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error(`Error fetching forms for template ${template.id}:`, error.message);
        } else {
          console.error(`Error fetching forms for template ${template.id}:`, String(error));
        }
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Error:', error);
    }
  }
}

listTemplatesAndForms(); 