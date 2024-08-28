import chalk from 'chalk';
import readlineSync from 'readline-sync';

// 플레이어 정보
class Player {
  constructor(hp = 100, mp = 100, mindamage = 10, maxdamage = 15) {
    this.hp = hp;
    this.mp = mp;
    this.mindamage = mindamage;
    this.maxdamage = maxdamage;
  }

  attack(monster) {
    // 플레이어의 공격
    let atk = Math.floor(Math.random() * (this.maxdamage - this.mindamage + 1)) + this.mindamage;
    monster.hp -= atk;
    return atk;
  }

  heal() {
    // 플레이어 회복 스킬
    if (this.mp < 5) {
      return 0; // 마나가 5 미만일 경우 회복 불가능
    }
    let healAmount = Math.floor(Math.random() * 21) + 5; // 5 ~ 25 회복
    this.hp += healAmount;
    this.mp -= 5;
    return healAmount;
  }

  tryToRun() {
    let runChance = Math.floor(Math.random() * 101);
    if (runChance <= 10) {
      // 10% 확률로 도망 가능
      let runSuccess = chalk.blue('플레이어가 도망에 성공했습니다!!');
      console.log(runSuccess);
      process.exit(0); // 도망 성공 시 게임 종료
    } else {
      let runFail = chalk.red('도망 실패ㅠ');
      console.log(runFail);
      return runFail;
    }
  }

  // 스테이지 클리어 시 스탯 증가
  StageReward() {
    this.hp += 30;
    this.mp += 10;
    this.mindamage += 3;
    this.maxdamage += 3;
  }
}

// 몬스터 정보
class Monster {
  constructor(hp = 20, damage = 6) {
    this.hp = hp;
    this.damage = damage;
  }

  attack(player) {
    let atk = this.damage;
    player.hp -= atk;
    return atk;
  }
}

// 스테이터스 창
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== 스테이터스 창 ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(
        `| 플레이어 HP : ${player.hp}, MP : ${player.mp}, Damage : ${player.mindamage} ~ ${player.maxdamage} `,
      ) +
      chalk.redBright(`| 몬스터 HP : ${monster.hp}, Damage : ${monster.damage} |`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\n1. 공격한다 2. 회복한다(MP 5 소모) 3. 도망친다(10%) `));
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.yellow(`${choice}를 선택하셨습니다.`));

    switch (parseInt(choice)) {
      case 1:
        let atkdamage = player.attack(monster);
        logs.push(
          chalk.green(`플레이어가 몬스터를 공격하여 ${atkdamage}의 피해를 입혔습니다!`),
          chalk.red(`몬스터가 플레이어를 공격하여 ${monster.damage}의 피해를 입혔습니다!`),
        );
        break;
      case 2:
        if (player.mp >= 5) {
          let healAmount = player.heal();
          logs.push(
            chalk.green(`플레이어가 ${healAmount}만큼 회복했습니다!`),
            chalk.blue(`플레이어가 5의 마나를 소모해 ${player.mp}의 마나가 남았습니다!`),
            chalk.red(`몬스터가 플레이어를 공격하여 ${monster.damage}의 피해를 입혔습니다!`),
          );
        } else {
          logs.push(
            chalk.red('MP가 부족하여 회복할 수 없습니다!'),
            chalk.red(`몬스터가 플레이어를 공격하여 ${monster.damage}의 피해를 입혔습니다!`),
          );
        }
        break;
      case 3:
        let runMessage = player.tryToRun();
        logs.push(
          runMessage,
          chalk.red(`몬스터가 플레이어를 공격하여 ${monster.damage}의 피해를 입혔습니다!`),
        );
        break;
      default:
        console.log('잘못된 선택입니다.');
        break;
    }

    // 몬스터가 살아있다면 플레이어 공격
    if (monster.hp > 0) {
      monster.attack(player);
    }
  }

  if (player.hp <= 0) {
    console.log(chalk.red('플레이어가 사망하였습니다...'));
  } else if (monster.hp <= 0) {
    console.log(chalk.green('몬스터를 물리쳤습니다!'));
  }
};

let rewardMessage = async () => {
  console.clear(); // 증가 능력치 보여주는 동안 잠깐 콘솔창 비우기
  console.log(
    chalk.yellow('플레이어의 HP + 30 , MP + 10 , mindamage + 3, maxdamage + 3 만큼 증가 !'),
  );
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 증가 능력치 2초 동안 표시되게 하기
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    console.log(chalk.magentaBright(`\n=== Stage ${stage} ===`));
    const monster = new Monster(stage * 20, 2 * stage); // 스테이지에 따라 몬스터의 체력과 공격력 강해짐
    await battle(stage, player, monster);

    // 플레이어가 살아있으면 스테이지 클리어
    if (player.hp > 0) {
      player.StageReward(); // 스테이지 클리어 시 플레이어 능력치 증가
      await rewardMessage(); // 능력치 증가치 잠시 표시
      stage++;
    } else {
      break; // 플레이어가 죽으면 게임 종료
    }
  }

  if (player.hp > 0) {
    console.log(chalk.green('축하합니다! 모든 스테이지를 클리어했습니다!'));
  } else {
    console.log(chalk.red('게임 오버!'));
  }
}
