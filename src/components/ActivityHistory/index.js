import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { fetchQuests } from '../../quests'
import { useWeb3React } from '@web3-react/core'
import { useENSName } from '../../hooks'

const Wrapper = styled.div`
  display: grid;
  grid-template-areas: "leaderboard history";
  grid-template-rows: auto;
  grid-template-columns: 500px 1fr;
`

const Leaderboard = styled.div`
  grid-area: leaderboard;
  width: 80%;
  margin: auto;
  margin-top: 25px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;

  & > img {
    width: 45px;
    height: 58px;
  }

  & > div {
    display: inline-block;
    margin-left: 15px;
  }
`

const SubHeading = styled.span`
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #A1A4B1;
`

const Board = styled.div`
  width: 90%;
  border: 1px solid ${({ theme }) => theme.outlinePurple};
  border-radius: 10px;
  background: #1F1F1F;
  font-size: 14px;
  padding: 10px;
  margin-top: 50px;
`

const Leader = styled.div`
  display: grid;
  grid-template-columns: 30px 55px auto 65px;
  grid-template-areas: "num moji name drip";
  padding: 5px;
  line-height: 25px;
  vertical-align: middle;
  color: ${({ isUser }) => isUser ? 'yellow' : 'inherit'};

  & > img {
    width: 25px;
    height: 25px;
    margin: auto;
  }
`

const DripScore = styled.span`
  grid-area: drip;
  color: #8DFBC9;
  font-family: Inter;
  display: flex;
  justify-content: center;
  align-items: center;

  & > img {
    height: 15px;
    margin-left: 3px;
  }
`

const Separator = styled.hr`
  margin: 30px auto;
  width: 60%
  border: 1px solid rgba(255, 255, 255, 0.1)
`

const History = styled.div`
  margin-top: 25px;
  grid-area: history;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  display: grid;
  grid-template-areas: "header link"\n"activities activities";
  grid-template-columns: 500px 160px;
  grid-template-rows: 100px auto;
`

const CopyLink = styled.div`
  grid-area: link;
  color: #A1A4B1;
  font-size: 10px;
  height: 27px;
  border: 1px solid ${({ theme }) => theme.outlinePurple};
  border-radius: 20px;
  background: #1F1F1F;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

  & > img {
    margin-right: 5px;
  }
`

const Day = styled.div`
  display: grid;
  grid-template-areas: "day day"\n"gutter activities";
  grid-template-columns: 44px auto;
  grid-template-rows: 50px auto;
  margin-bottom: 30px;
`

const Date = styled.div`
  grid-area: day;
  text-align: left;
  color: #A1A4B1;
`

const Gutter = styled.div`
  grid-area: gutter;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
`
const Activities = styled.div`
  grid-area: activities;
`

const Activity = styled.div`
  display: grid
  grid-template-columns: 75px auto 75px 75px; 
  grid-template-areas: "icon main points link";
  border: 1px solid ${({ theme }) => theme.outlinePurple};
  border-radius: 10px;
  background: #1F1F1F;
  height: 75px;
  text-align: left;
  margin-bottom: 20px;
  vertical-align: center;

  &:last-of-type {
    margin-bottom: 0;
  }
`

const Icon = styled.div`
  grid-area: icon;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #343434;
  height: 40px;
  width: 40px;
  border-radius: 50%;

  & > * {
    height: 32px;
    width: 32px;
    border-radius: 50%;
  }

  @media (max-width: 970px) {
    margin-left: 1rem;
  }

  @media (max-width: 525px) {
    margin-left: 0.5rem;
  }
`

const QuestOverview = styled.div`
  grid-area: main;
  width: 100%;
  padding-left: 15px;
  display: flex;
  flex-flow: column;
  justify-content: center;
`

const Platform = styled.div`
  font-size: 10px;
  color: ${({color}) => color};
  text-transform: uppercase;
`

const BlurbWrapper = styled.div`
  width: fit-content;
  font-size: 14px;

  @media (max-width: 670px) {
    width: 200px;
  }
`

const Points = styled.div`
  grid-area: points;
  border: 1px solid rgba(141, 251, 201, 0.4);
  border-radius: 15px;
  color: #8DFBC9;
  height: 27px;
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Inter;
  font-size 13px;
  font-weight: bold;
  margin: auto;
`

const DripSymbol = styled.img`
  height: 15px;
  margin-left: 3px;
`

const Link = styled.div`
  grid-area: link;
  display: flex;
  justify-content: center;
  align-items: center;

  & > a > img {
    padding-top: 4px;
  }
`

const leaderboardWithUser = {
  user: {
    position: 135,
    name: "scottoshi.eth",
    imageUrl: "ethmoji_sample.png",
    points: 200,
    onLeaderboard: false
  },
  leaders: [
    {
      name: "scottrepreneur.eth",
      imageUrl: "ethmoji_sample.png",
      points: 1000,
    },
    {
      name: "vitalik.eth",
      imageUrl: "ethmoji_sample.png",
      points: 999
    },
    {
      name: "flynn.eth",
      imageUrl: "ethmoji_sample.png",
      points: 988
    },
    {
      name: "eric.eth",
      imageUrl: "ethmoji_sample.png",
      points: 900
    },
    {
      name: "ismoney.eth",
      imageUrl: "ethmoji_sample.png",
      points: 850
    },
    {
      name: "rainbow.eth",
      imageUrl: "ethmoji_sample.png",
      points: 800
    },
    {
      name: "stan36.eth",
      imageUrl: "ethmoji_sample.png",
      points: 700
    },
    {
      name: "matthew.cent.eth",
      imageUrl: "ethmoji_sample.png",
      points: 600
    },
    {
      name: "toast.eth",
      imageUrl: "ethmoji_sample.png",
      points: 500
    },
    {
      name: "defidude.eth",
      imageUrl: "ethmoji_sample.png",
      points: 400
    }
  ]
}

const theHistory = [
  {
    date: "3/20/2020",
    activities: [
      {
        name: 'SET-101',
        blurb: 'Buy a token set on Set Protocol',
        task: 'Buy a token set on Set Protocol.',
        description:
          'Set Protocol is a platform on Ethereum that enhances your portfolio with automated asset management strategies.',
        resource: 'https://www.tokensets.com/',
        platform: 'Set Protocol',
        color: '#ECC251',
        imgPath: 'set.svg',
        type: 'track',
        points: 100,
        progress: 0,
        url: 'https://etherscan.io/token/0xbb9bc244d798123fde783fcc1c72d3bb8c189413'
      },
      {
        name: 'SET-102',
        blurb: 'Buy a token set on Set Protocol',
        task: 'Buy a token set on Set Protocol.',
        description:
          'Set Protocol is a platform on Ethereum that enhances your portfolio with automated asset management strategies.',
        resource: 'https://www.tokensets.com/',
        platform: 'Set Protocol',
        color: '#ECC251',
        imgPath: 'set.svg',
        type: 'track',
        points: 100,
        progress: 0,
        url: 'https://etherscan.io/token/0xbb9bc244d798123fde783fcc1c72d3bb8c189413'
      },
      {
        name: 'SET-103',
        blurb: 'Buy a token set on Set Protocol',
        task: 'Buy a token set on Set Protocol.',
        description:
          'Set Protocol is a platform on Ethereum that enhances your portfolio with automated asset management strategies.',
        resource: 'https://www.tokensets.com/',
        platform: 'Set Protocol',
        color: '#ECC251',
        imgPath: 'set.svg',
        type: 'track',
        points: 100,
        progress: 0,
        url: 'https://etherscan.io/token/0xbb9bc244d798123fde783fcc1c72d3bb8c189413'
      },
    ]
  },
  {
    date: "3/21/2020",
    activities: [
      {
        name: 'SET-104',
        blurb: 'Buy a token set on Set Protocol',
        task: 'Buy a token set on Set Protocol.',
        description:
          'Set Protocol is a platform on Ethereum that enhances your portfolio with automated asset management strategies.',
        resource: 'https://www.tokensets.com/',
        platform: 'Set Protocol',
        color: '#ECC251',
        imgPath: 'set.svg',
        type: 'track',
        points: 100,
        progress: 0,
        url: 'https://etherscan.io/token/0xbb9bc244d798123fde783fcc1c72d3bb8c189413'
      },
      {
        name: 'SET-105',
        blurb: 'Buy a token set on Set Protocol',
        task: 'Buy a token set on Set Protocol.',
        description:
          'Set Protocol is a platform on Ethereum that enhances your portfolio with automated asset management strategies.',
        resource: 'https://www.tokensets.com/',
        platform: 'Set Protocol',
        color: '#ECC251',
        imgPath: 'set.svg',
        type: 'track',
        points: 100,
        progress: 0,
        url: 'https://etherscan.io/token/0xbb9bc244d798123fde783fcc1c72d3bb8c189413'
      },
    ]
  }
]


export default function ActivityHistory() {
  const [quests, setQuests] = useState([])

  const { account } = useWeb3React()

  const ENSName = useENSName(account)

  useEffect(() => {
    fetchQuests(ENSName, account).then(data => {
      console.log(data)
      setQuests(data)
    })
  }, [ENSName, account])

  return (
    <Wrapper>
      <Leaderboard>
        <img src={require('../../assets/images/drip_symbol.svg')} alt="Drip" />
        <div>
          Leaderboard
          <SubHeading>Who's got more drip?</SubHeading>
        </div>
        <Board>
          {leaderboardWithUser.leaders.map((leader, i) => {
            return (
              <Leader key={i} isUser={leaderboardWithUser.user.onLeaderboard}>
                <span style={{ gridArea: 'num' }}>{i+1}.</span>
                <img src={require('../../assets/images/' + leader.imageUrl)} alt={leader.name} style={{ gridArea: 'moji' }}/>
                <span style={{ gridArea: 'name' }}>{leader.name}</span>
                <DripScore>{leader.points} <img src={require('../../assets/images/drip_symbol.svg')} alt="Drip" /></DripScore>
              </Leader>
            );
          })}
          {!leaderboardWithUser.user.onLeaderboard ? (
            <>
              <Separator />
              <Leader isUser={leaderboardWithUser.user.onLeaderboard}>
                <span style={{ gridArea: 'num' }}>{leaderboardWithUser.user.position}.</span>
                <img src={require('../../assets/images/' + leaderboardWithUser.user.imageUrl)} alt={leaderboardWithUser.user.name} style={{ gridArea: 'moji' }}/>
                <span style={{ gridArea: 'name' }}>{leaderboardWithUser.user.name}</span>
                <DripScore>{leaderboardWithUser.user.points} <img src={require('../../assets/images/drip_symbol.svg')} alt="Drip" /></DripScore>
              </Leader>
            </>
          ): null }
        </Board>
      </Leaderboard>
      <History>
        <div style={{ gridArea: 'header' }}>
          History
          <SubHeading>Ode to the journey</SubHeading>
        </div>
        <CopyLink>
          <img src={require('../../assets/images/clip.png')} alt="copy to clipboard" /> Copy link to clipboard
        </CopyLink>
        <div style={{ gridArea: 'activities' }}>
          {quests.map(quest => {
            if (quest.progress >= 100) {
              return (
                <Activity key={quest.name}>
                  <Icon>
                    <img src={require('../../assets/images/' + quest.imgPath)} alt="" />
                  </Icon>
                  <QuestOverview>
                    <Platform color={quest.color}>{quest.platform}</Platform>
                    <BlurbWrapper>{quest.blurb}</BlurbWrapper>
                  </QuestOverview>
                  <Points style={{ gridArea: 'points' }}>{quest.points}<DripSymbol src={require('../../assets/images/drip_symbol.svg')}/></Points>
                  <Link>
                    <a href={quest.url}><img src={require('../../assets/images/globe.png')} alt="etherscan link" /></a>
                  </Link>
                </Activity>
              )
            }})}
        </div>
      </History>
    </Wrapper>
  );
}
