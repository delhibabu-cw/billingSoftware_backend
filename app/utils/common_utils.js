const { errorHandlerFunction } = require('../middlewares/error');
// const db = require('../models');

module.exports = {
  paginationFn: async (
    res,
    model,
    findQuery,
    perPage = 10,
    currentPage = 0,
    populateValues = null,
    sort = null,
    select = null,
  ) => {
    console.log('findQuery', findQuery)
    try {
      const numOfLessons = await model.find(findQuery).countDocuments()
      const currPage = parseInt(currentPage)
      console.log('numOfLessons', numOfLessons, sort)
      const data = await model
        .find(findQuery)
        .populate(populateValues)
        .limit(perPage)
        .skip(perPage * currPage)
        .sort(sort)
        .select(select)
      return {
        rows: data,
        pagination: {
          currPage,
          pages: Math.ceil(numOfLessons / perPage),
          total: numOfLessons,
        },
      }
    } catch (error) {
      errorHandlerFunction(res, error);
    }
  },
  findDuplicates: (arr, key) => {
    const duplicates = []
    const seen = new Set()

    arr.forEach((item) => {
      const value = item[key]

      if (seen.has(value)) {
        duplicates.push(value)
      } else {
        seen.add(value)
      }
    })

    return duplicates
  },
  paginationArray: async (array, perPage, currentPage) => {
    const itemsPerPage = perPage ? parseInt(perPage) : 10
    // Get the "page" query parameter from the request
    console.log('items------per page-------', itemsPerPage)
    const page = parseInt(currentPage) || 0
    console.log('page----------', parseInt(currentPage))
    // Calculate the starting index and ending index for the current page
    const startIndex = page * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const totalPages = Math.ceil(array.length / itemsPerPage)
    const data = array.slice(startIndex, endIndex)
    return {
      rows: data,
      pagination: {
        currentPage: page || 0,
        pages: totalPages,
        total: array.length,
      },
    }
  },
  paginationArrayNameChange: async (array, perPage, currentPage) => {
    const itemsPerPage = perPage ? parseInt(perPage) : 10
    // Get the "page" query parameter from the request
    console.log('items------per page-------', itemsPerPage)
    const page = parseInt(currentPage) || 0
    console.log('page----------', page)
    // Calculate the starting index and ending index for the current page
    const startIndex = page * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const totalPages = Math.ceil(array.length / itemsPerPage)
    const data = array.slice(startIndex, endIndex)
    return {
      data,
      page: {
        currentPage: page || 0,
        pages: totalPages,
        total: array.length,
      },
    }
  },
  getUserEmails: async (student, model) => {
    const findUsers = await model.find({
      _id: { $in: student },
      isDeleted: false,
    })
    console.log('findUsers.length--------', findUsers.length)
    const emails = findUsers.map((user) => user.email)
    return emails
  },
  getSingleUserEmails: async (user, model) => {
    const findUsers = await model.findOne({ _id: user, isDeleted: false })
    return findUsers.email
  },
  numberToWords: (number) => {
    const units = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ]
    const teens = [
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ]
    const tens = [
      '',
      'Ten',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ]

    function convertTwoDigits(num) {
      if (num < 10) {
        return units[num]
      } else if (num < 20) {
        return teens[num - 11]
      } else {
        const digit = num % 10
        const tenDigit = Math.floor(num / 10)
        return `${tens[tenDigit]}${units[digit]}`
      }
    }

    function convertThreeDigits(num) {
      const hundredDigit = Math.floor(num / 100)
      const twoDigitPart = num % 100
      const result = []

      if (hundredDigit > 0) {
        result.push(`${units[hundredDigit]} Hundred`)
      }

      if (twoDigitPart > 0) {
        result.push(convertTwoDigits(twoDigitPart))
      }

      return result.join(' ')
    }

    if (number === 0) {
      return 'Zero'
    }

    const crore = Math.floor(number / 10000000)
    const lakh = Math.floor((number % 10000000) / 100000)
    const thousand = Math.floor((number % 100000) / 1000)
    const remainder = number % 1000

    const result = []

    if (crore > 0) {
      result.push(`${convertThreeDigits(crore)} Crore`)
    }

    if (lakh > 0) {
      result.push(`${convertThreeDigits(lakh)} Lakh`)
    }

    if (thousand > 0) {
      result.push(`${convertThreeDigits(thousand)} Thousand`)
    }

    if (remainder > 0) {
      result.push(convertThreeDigits(remainder))
    }

    return result.join(' ')
  },
  amountShortName: (number) => {
    const lakh = 100000
    const crore = 10000000
    if (number >= crore) {
      return (
        (number / crore).toLocaleString('en-IN', { maximumFractionDigits: 2 }) +
        'Cr'
      )
    } else if (number >= lakh) {
      return (
        (number / lakh).toLocaleString('en-IN', { maximumFractionDigits: 2 }) +
        'L'
      )
    } else if (number >= 1000) {
      return (
        (number / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) +
        'K'
      )
    } else {
      return number.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    }
  },
  getPincodeDetails: async (pincode) => {
    const apiUrl = `https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&filters%5Bpincode%5D=${pincode}`
    const response = await axios.get(apiUrl)
    return response.data.records
  },
  // Otp timer
  saveAndScheduleRemoval: async (id) => {
    try {
      let savedData
      const newData = await MobileOTPModel.findOne({ mobile: id })

      if (newData) {
        savedData = await newData.save()
        console.log('Already exist Data saved successfully:', savedData)
      } else {
        const newData = new MobileOTPModel({ mobile: id })
        savedData = await newData.save()
        console.log('New Data saved successfully', savedData)
      }

      // Wait for two minutes
      await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000))

      // Remove the document by ID
      await MobileOTPModel.findByIdAndRemove(savedData._id)
      console.log('Data removed successfully after two minutes.')
    } catch (error) {
      console.error('Error saving or removing data:', error)
    }
  },
  ejsRender: async (filePath, data) => {
    return new Promise((resolve, reject) => {
      ejs.renderFile(filePath, data, (err, html) => {
        if (err) {
          reject(err)
        } else {
          resolve(html)
        }
      })
    })
  },
  createPdfBuffer: async (html) => {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
    })
    const page = await browser.newPage()
    // console.log('html------------', html);
    await page.setContent(html)
    // await page.goto('https://devapi.printon.co.in/auth/invoice')
    const pdfBuffer = await page.pdf({
      // '-webkit-print-color-adjust': 'exact',
      format: 'A4',
      margin: {
        top: '20px',
        left: '20px',
        right: '20px',
      },
    })
    await browser.close()
    return pdfBuffer
  },
  uploadToS3: async (buffer) => {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
      const fileName = `proposal/${timestamp}.pdf`
      const folderName = 'proposal'
      const params = {
        Bucket: 'samsel',
        Key: `${folderName}/${fileName}`,
        Body: buffer,
        ContentType: 'application/pdf',
        ACL: 'public-read',
      }
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.Location)
        }
      })
    })
  },
  downloadFile: async (url, localFilename) => {
    const writer = fs.createWriteStream(localFilename)
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  },
  uploadToMp3: async (localFile) => {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(localFile)

      const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
      const fileName = `recort/${timestamp}.mp3`
      const folderName = 'tele'
      const params = {
        Bucket: 'samsel',
        Key: `${folderName}/${fileName}`,
        Body: fileStream,
        ContentType: 'auido/mpeg',
        ACL: 'public-read',
      }
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.Location)
        }
      })
    })
  },
  deleteFile: async (filePath) => {
    console.log('file deletedSuccessfully-------', filePath)
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  },
  // this function is for filter based on date
  oneDayTime: async (date) => {
    if (!date) date = new Date()
    date = new Date(date)
    date.setHours(0, 0, 0, 0)
    const dayStart = date.getTime()
    date.setHours(23, 59, 59, 999)
    const dayEnd = date.getTime()
    return { dayStart, dayEnd }
  },
  checkParams: (param) => {
    // Check if the parameter is a string
    if (typeof param === 'string') {
      // Check if the string consists of hexadecimal characters
      if (/^[0-9a-fA-F]{24}$/.test(param)) {
        return 'id';
      } else {
        return 'string';
      }
    } else {
      return 'Not a string';
    }
  },
  // convert name like url
  createSlug: (input) => {
    return input.toLowerCase().replace(/\s+/g, '-')
  },
    getTimeString: async () => {
    const time = new Date();
    const timeStamp = time.getFullYear().toString() +
      (time.getMonth() + 1).toString().padStart(2, '0') +
      time.getDate().toString().padStart(2, '0') +
      time.getHours().toString().padStart(2, '0') +
      time.getMinutes().toString().padStart(2, '0') +
      time.getSeconds().toString().padStart(2, '0') +
      time.getMilliseconds().toString().padStart(3, '0');
    return timeStamp;
  }
}